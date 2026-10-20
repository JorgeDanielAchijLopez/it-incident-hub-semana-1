
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

export const incidentesRouter = Router();

// Registro y consulta de incidentes
incidentesRouter.post("/", registrarIncidente);
incidentesRouter.get("/", listarIncidentes);

// Comentarios e historial
incidentesRouter.post("/:id/comentarios", registrarComentario);
incidentesRouter.get("/:id/comentarios", listarComentarios);

// Asignacion de tecnicos
incidentesRouter.patch("/:id/asignacion", asignarTecnico);

// Consulta individual
incidentesRouter.get("/:id", obtenerIncidente);
