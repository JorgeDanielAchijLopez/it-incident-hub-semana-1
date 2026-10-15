import { Router } from "express";
import {
  listarIncidentes,
  obtenerIncidente,
  registrarIncidente,
} from "../controllers/incidentes.controller";

export const incidentesRouter = Router();

incidentesRouter.post("/", registrarIncidente);
incidentesRouter.get("/", listarIncidentes);
incidentesRouter.get("/:id", obtenerIncidente);
