
import { useEffect, useState } from "react";

import {
  listarTecnicos,
  asignarTecnico,
  cambiarEstado,
  type Tecnico,
} from "../api/gestion";

import {
  nombreEstado,
  type Estado,
  type Incidente,
} from "../types/incidente";

interface Props {
  incidente: Incidente;
  onActualizado: (incidente: Incidente) => void;
}

const transiciones: Record<Estado, Estado[]> = {
  NUEVO: ["ASIGNADO"],
  ASIGNADO: ["EN_PROCESO"],
  EN_PROCESO: ["RESUELTO"],
  RESUELTO: ["CERRADO"],
  CERRADO: [],
};

export default function IncidentManagement({
  incidente,
  onActualizado,
}: Props) {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [tecnicoElegido, setTecnicoElegido] = useState("");
  const [estadoElegido, setEstadoElegido] = useState<Estado | "">("");

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<
    "tecnico" | "estado" | null
  >(null);

  const [errorTecnicos, setErrorTecnicos] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const estadosPermitidos = transiciones[incidente.estado];

  const necesitaTecnico =
    incidente.estado === "NUEVO" &&
    !incidente.tecnico_asignado;

  // Cargar los tecnicos disponibles
  useEffect(() => {
    const controller = new AbortController();

    listarTecnicos(controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) {
          setTecnicos(datos);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setErrorTecnicos(
            err instanceof Error
              ? err.message
              : "No se pudieron consultar los técnicos."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, []);

  // Asignar o reasignar un tecnico
  async function guardarTecnico() {
    const tecnicoId = Number(tecnicoElegido);

    if (!Number.isInteger(tecnicoId) || tecnicoId <= 0) {
      setError("Seleccioná un técnico válido.");
      return;
    }

    setProcesando("tecnico");
    setError("");
    setMensaje("");

    try {
      const actualizado = await asignarTecnico(
        incidente.id,
        tecnicoId
      );

      onActualizado(actualizado);

      setTecnicoElegido("");
      setMensaje("Técnico asignado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo asignar el técnico."
      );
    } finally {
      setProcesando(null);
    }
  }

  // Cambiar el estado del incidente
  async function guardarEstado() {
    if (!estadoElegido) {
      setError("Seleccioná un estado.");
      return;
    }

    if (!estadosPermitidos.includes(estadoElegido)) {
      setError("La transición seleccionada no está permitida.");
      return;
    }

    setProcesando("estado");
    setError("");
    setMensaje("");

    try {
      const actualizado = await cambiarEstado(
        incidente.id,
        estadoElegido
      );

      onActualizado(actualizado);

      setEstadoElegido("");
      setMensaje("Estado actualizado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado."
      );
    } finally {
      setProcesando(null);
    }
  }

  return (
    <section className="incident-management">
      <h3>Gestión del incidente</h3>

      <p className="management-description">
        Asigná un técnico y actualizá el estado del reporte.
      </p>

      {mensaje && (
        <p className="management-success" role="status">
          {mensaje}
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="management-block">
        <h4>Asignación de técnico</h4>

        <p className="management-current">
          Técnico actual:{" "}
          <strong>
            {incidente.tecnico_asignado || "Sin asignar"}
          </strong>
        </p>

        <label htmlFor={`tecnico-${incidente.id}`}>
          Seleccionar técnico
        </label>

        <select
          id={`tecnico-${incidente.id}`}
          value={tecnicoElegido}
          disabled={cargando || procesando !== null}
          onChange={(evento) => {
            setTecnicoElegido(evento.target.value);
            setError("");
          }}
        >
          <option value="">Seleccionar técnico</option>

          {tecnicos.map((tecnico) => (
            <option key={tecnico.id} value={tecnico.id}>
              {tecnico.nombre} - {tecnico.especialidad}
            </option>
          ))}
        </select>

        {cargando && <p>Cargando técnicos...</p>}

        {errorTecnicos && (
          <p className="form-error" role="alert">
            {errorTecnicos}
          </p>
        )}

        <button
          type="button"
          className="btn btn-primary"
          disabled={
            !tecnicoElegido ||
            cargando ||
            procesando !== null
          }
          onClick={() => void guardarTecnico()}
        >
          {procesando === "tecnico"
            ? "Guardando..."
            : "Guardar asignación"}
        </button>
      </div>

      <div className="management-block">
        <h4>Cambio de estado</h4>

        <p className="management-current">
          Estado actual:{" "}
          <strong>{nombreEstado(incidente.estado)}</strong>
        </p>

        {estadosPermitidos.length > 0 ? (
          <>
            <label htmlFor={`estado-${incidente.id}`}>
              Nuevo estado
            </label>

            <select
              id={`estado-${incidente.id}`}
              value={estadoElegido}
              disabled={
                procesando !== null ||
                necesitaTecnico
              }
              onChange={(evento) => {
                setEstadoElegido(
                  evento.target.value as Estado | ""
                );
                setError("");
              }}
            >
              <option value="">Seleccionar estado</option>

              {estadosPermitidos.map((estado) => (
                <option key={estado} value={estado}>
                  {nombreEstado(estado)}
                </option>
              ))}
            </select>

            {necesitaTecnico && (
              <p className="management-help">
                Primero debés asignar un técnico.
              </p>
            )}

            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !estadoElegido ||
                necesitaTecnico ||
                procesando !== null
              }
              onClick={() => void guardarEstado()}
            >
              {procesando === "estado"
                ? "Actualizando..."
                : "Actualizar estado"}
            </button>
          </>
        ) : (
          <p className="management-help">
            El incidente está cerrado.
            No hay más transiciones disponibles.
          </p>
        )}
      </div>
    </section>
  );
}
