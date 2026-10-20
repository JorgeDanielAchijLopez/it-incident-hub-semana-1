
import { z } from "zod";

export const asignarTecnicoSchema = z.strictObject({
  tecnico_id: z.number().int().positive().max(2147483647),
});
