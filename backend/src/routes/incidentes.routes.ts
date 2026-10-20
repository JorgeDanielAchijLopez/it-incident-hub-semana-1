
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

export const incidentesRouter = Router();

// Registro y consulta de incidentes
incidentesRouter.post("/", registrarIncidente);
incidentesRouter.get("/", listarIncidentes);

// Comentarios e historial de cada incidente
incidentesRouter.post("/:id/comentarios", registrarComentario);
incidentesRouter.get("/:id/comentarios", listarComentarios);

// Consulta individual de incidentes
incidentesRouter.get("/:id", obtenerIncidente);
