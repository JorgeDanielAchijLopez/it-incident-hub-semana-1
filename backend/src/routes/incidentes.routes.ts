
import { Router } from "express";

import {
  listarIncidentes,
  obtenerIncidente,
  registrarIncidente,
} from "../controllers/incidentes.controller";

import {
  listarComentarios,
  registrarComentario,
} from "../controllers/comentarios.controller";

import {
  asignarTecnico,
} from "../controllers/asignaciones.controller";

import {
  cambiarEstado,
} from "../controllers/estados.controller";

export const incidentesRouter = Router();

// Registrar y consultar incidentes
incidentesRouter.post("/", registrarIncidente);
incidentesRouter.get("/", listarIncidentes);

// Comentarios de seguimiento
incidentesRouter.post("/:id/comentarios", registrarComentario);
incidentesRouter.get("/:id/comentarios", listarComentarios);

// Asignar o reasignar tecnicos
incidentesRouter.patch("/:id/asignacion", asignarTecnico);

// Cambiar estado de un incidente
incidentesRouter.patch("/:id/estado", cambiarEstado);

// Consultar un incidente especifico
incidentesRouter.get("/:id", obtenerIncidente);
