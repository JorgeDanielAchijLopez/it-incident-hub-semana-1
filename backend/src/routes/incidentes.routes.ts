
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

import {
  obtenerEstadisticas,
} from "../controllers/estadisticas.controller";

export const incidentesRouter = Router();

// Registrar y consultar incidentes
incidentesRouter.post("/", registrarIncidente);
incidentesRouter.get("/", listarIncidentes);

// Estadísticas de incidentes
incidentesRouter.get("/estadisticas", obtenerEstadisticas);

// Comentarios de seguimiento
incidentesRouter.post("/:id/comentarios", registrarComentario);
incidentesRouter.get("/:id/comentarios", listarComentarios);

// Asignación y reasignación de técnicos
incidentesRouter.patch("/:id/asignacion", asignarTecnico);

// Cambiar estado del incidente
incidentesRouter.patch("/:id/estado", cambiarEstado);

// Consultar un incidente específico
incidentesRouter.get("/:id", obtenerIncidente);
