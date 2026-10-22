#!/usr/bin/env node
"use strict";

// Control de seguridad reproducible para backend, frontend y herramientas.
// Las auditorias completas son informativas. En produccion, los hallazgos
// HIGH y CRITICAL bloquean el pipeline. Un fallo de npm/registro tambien bloquea.

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const carpeta = path.resolve(process.argv[2] || path.join(raiz, "auditorias"));
const maximo = 15 * 1024 * 1024;

const objetivos = [
  { nombre: "backend-produccion", ruta: "backend", produccion: true },
  { nombre: "frontend-produccion", ruta: "frontend", produccion: true },
  { nombre: "backend-desarrollo", ruta: "backend", produccion: false },
  { nombre: "frontend-desarrollo", ruta: "frontend", produccion: false },
  { nombre: "raiz-desarrollo", ruta: ".", produccion: false }
];

function contar(entrada) {
  const v = entrada && entrada.metadata && entrada.metadata.vulnerabilities;
  const niveles = ["info", "low", "moderate", "high", "critical"];
  if (!v || niveles.some((nivel) =>
    typeof v[nivel] !== "number" || !Number.isInteger(v[nivel]) || v[nivel] < 0
  )) {
    throw new Error("Informe incompleto o no valido; puede haber fallado npm audit.");
  }
  return { info: v.info, low: v.low, moderate: v.moderate, high: v.high, critical: v.critical };
}

function validarParser() {
  const limpio = { metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 } } };
  const peligro = { metadata: { vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 1 } } };
  if (contar(limpio).high !== 0 || contar(peligro).critical !== 1) {
    throw new Error("Fallaron los casos de prueba del analizador.");
  }
  let errorDetectado = false;
  try { contar({ error: { code: "ENOAUDIT" } }); } catch { errorDetectado = true; }
  if (!errorDetectado) {
    throw new Error("El analizador acepto una respuesta invalida.");
  }
  console.log("OK: validacion de informes limpios, criticos e incompletos.");
}

if (process.argv.includes("--self-test")) {
  validarParser();
} else {
  fs.mkdirSync(carpeta, { recursive: true });
  const resumen = [
    "# Auditoria de seguridad - IT Incident Hub",
    "",
    "Politica: las vulnerabilidades HIGH/CRITICAL de produccion bloquean CI.",
    "Los hallazgos de desarrollo quedan documentados sin bloquear esta etapa.",
    "",
    "| Alcance | Bajas | Moderadas | Altas | Criticas | Resultado |",
    "| --- | ---: | ---: | ---: | ---: | --- |"
  ];
  let bloqueado = false;

  for (const objetivo of objetivos) {
    const argumentos = ["audit", "--json"];
    if (objetivo.produccion) argumentos.push("--omit=dev");
    argumentos.push("--prefix", objetivo.ruta);

    console.log("Auditoria: " + objetivo.nombre);
    const salida = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", argumentos, {
      cwd: raiz,
      encoding: "utf8",
      maxBuffer: maximo,
      timeout: 180000,
      shell: process.platform === "win32",
      windowsHide: true
    });

    let detalle = "OK";
    let conteos = null;
    try {
      if (salida.error) throw salida.error;
      const datos = JSON.parse(salida.stdout || "");
      conteos = contar(datos);
      fs.writeFileSync(path.join(carpeta, objetivo.nombre + ".json"),
        JSON.stringify(datos, null, 2) + "\n", "utf8");
      if (![0, 1].includes(salida.status)) {
        throw new Error("npm audit termino con codigo " + salida.status);
      }
      if (objetivo.produccion && (conteos.high > 0 || conteos.critical > 0)) {
        detalle = "BLOQUEADO";
        bloqueado = true;
      } else if (!objetivo.produccion && (conteos.high > 0 || conteos.critical > 0)) {
        detalle = "Revisar desarrollo";
      }
      console.log(objetivo.nombre + ": " + JSON.stringify(conteos) + " - " + detalle);
    } catch (error) {
      bloqueado = true;
      detalle = "ERROR DE AUDITORIA";
      fs.writeFileSync(path.join(carpeta, objetivo.nombre + "-error.txt"),
        String(error.message || error) + "\n" +
        (salida.stderr || "").slice(0, 2000) + "\n", "utf8");
      console.error("ERROR " + objetivo.nombre + ": " + (error.message || error));
    }

    const c = conteos || { low: "-", moderate: "-", high: "-", critical: "-" };
    resumen.push("| " + objetivo.nombre + " | " + c.low + " | " +
      c.moderate + " | " + c.high + " | " + c.critical + " | " + detalle + " |");
  }

  resumen.push("", bloqueado ?
    "RESULTADO: control de seguridad NO APROBADO. Revisar informes y dependencias." :
    "RESULTADO: control de seguridad APROBADO para dependencias de produccion.",
    "", "No se deben subir secretos a los informes ni usar excepciones sin documentarlas.");
  fs.writeFileSync(path.join(carpeta, "resultado-seguridad.md"),
    resumen.join("\n") + "\n", "utf8");
  if (bloqueado) process.exitCode = 1;
}
