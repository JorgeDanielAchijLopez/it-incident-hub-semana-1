
import { z } from "zod";

export const crearComentarioSchema = z.object({
  autor: z.string()
    .trim()
    .min(2, "El autor debe tener al menos 2 caracteres.")
    .max(120, "El nombre del autor es demasiado largo."),

  contenido: z.string()
    .trim()
    .min(3, "El comentario debe tener al menos 3 caracteres.")
    .max(5000, "El comentario es demasiado largo."),
});
