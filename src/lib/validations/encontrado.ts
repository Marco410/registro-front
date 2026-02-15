import { z } from "zod";

export const encontradoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido_p: z.string().min(1, "El apellido paterno es obligatorio"),
  apellido_m: z.string().optional(),
  sexo: z.string().min(1, "El sexo es obligatorio"),
  fecha_n: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  estado_c: z.string().min(1, "El estado civil es obligatorio"),
  telefono: z.string().optional(),
  nom_ref: z
    .string()
    .min(
      1,
      " El nombre del contacto de emergencia es obligatorio. Puede ser sus padres, hermanos, amigos, tios, conocidos, etc.",
    ),
  tel_ref: z
    .string()
    .min(1, "El teléfono del contacto de emergencia es obligatorio"),
  enfermedad: z.string().optional(),
  user_id: z.string().min(1, "El ID del usuario es obligatorio"),
});

export type EncontradoFormData = z.infer<typeof encontradoSchema>;
