import { DEFAULT_CELULAR } from "registro/constants/const";
import { z } from "zod";

export type EncontradoEventMode = "ninos" | "retiro" | null | undefined;

/**
 * Esquema de validación según el tipo de evento activo (`ninos` vs resto).
 * En modo niños: estado civil, religión y teléfono no son obligatorios; la dirección sí.
 */
export function getEncontradoSchema(eventType: EncontradoEventMode) {
  const isNinos = eventType === "ninos";
  return z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    apellido_p: z.string().min(1, "El apellido paterno es obligatorio"),
    apellido_m: z.string().optional(),
    sexo: z.string().min(1, "El sexo es obligatorio"),
    fecha_n: z.string().min(1, "La fecha de nacimiento es obligatoria"),
    estado_c: isNinos
      ? z.string()
      : z.string().min(1, "El estado civil es obligatorio"),
    religion: isNinos
      ? z.string()
      : z.string().min(1, "La religión es obligatoria"),
    telefono: z.string().optional(),
    nom_ref: z
      .string()
      .min(
        1,
        "El nombre del contacto de emergencia es obligatorio. Puede ser sus padres, hermanos, amigos, tíos, conocidos, etc.",
      ),
    tel_ref: z
      .string()
      .min(1, "El teléfono del contacto de emergencia es obligatorio"),
    enfermedad: z.string().optional(),
    celular: z.boolean().default(DEFAULT_CELULAR),
    medicamento: z.boolean().default(false),
    user_id: z.string().min(1, "El ID del usuario es obligatorio"),
    address: isNinos
      ? z.string().trim().min(1, "La dirección es obligatoria")
      : z.string().optional(),
  });
}

/** Esquema por defecto (evento retiro u otro): mismo comportamiento que antes de eventos niños. */
export const encontradoSchema = getEncontradoSchema("retiro");

export type EncontradoFormData = z.infer<typeof encontradoSchema>;
