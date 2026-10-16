import { z } from "zod";

export const crearIncidenteSchema = z.strictObject({
  titulo: z.string().trim().min(5).max(150),
  descripcion: z.string().trim().min(10),
  categoria: z.string().trim().min(2).max(80),
  prioridad: z.enum(["BAJA", "MEDIA", "ALTA", "CRITICA"]),
  usuario_reporta: z.string().trim().min(2).max(120),
});

export type CrearIncidente = z.infer<typeof crearIncidenteSchema>;
