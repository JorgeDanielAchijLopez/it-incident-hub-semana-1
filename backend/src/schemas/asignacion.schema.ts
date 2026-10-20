
import { z } from "zod";

export const asignarTecnicoSchema = z.strictObject({
  tecnico_id: z.number().int().positive().max(2147483647),

  responsable: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .optional(),
});
