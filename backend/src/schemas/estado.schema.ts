
import { z } from "zod";

export const actualizarEstadoSchema = z.strictObject({
  estado: z.enum([
    "NUEVO",
    "ASIGNADO",
    "EN_PROCESO",
    "RESUELTO",
    "CERRADO",
  ]),
});

export type EstadoIncidente = z.infer<
  typeof actualizarEstadoSchema
>["estado"];
