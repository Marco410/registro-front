import { z } from "zod";

/** Roles que existen en el backend (`Role.name`). Solo `admin` cambia lo que se ve en el front. */
export const ROLES_USUARIO = [
  {
    value: "user",
    label: "Usuario",
    description: "Registro, check-in, aforo y estadísticas.",
  },
  {
    value: "register",
    label: "Registro",
    description: "Registro, check-in, aforo y estadísticas.",
  },
  {
    value: "admin",
    label: "Administrador",
    description: "Todo lo anterior, más Eventos, Usuarios y Auditoría.",
  },
] as const;

export type RolUsuario = (typeof ROLES_USUARIO)[number]["value"];

/** Dominio del correo que se asigna a cada usuario (`email` es único en el backend). */
export const EMAIL_DOMAIN = "email.com";

/**
 * Usuario a partir de nombre y apellido, como lo genera el backend
 * (`genUniqueLink`): minúsculas y espacios a puntos. Además quita acentos y
 * caracteres no válidos para que el correo derivado también sea válido.
 * "Marco Castañeda" → "marco.castaneda".
 */
export function generarUsername(name: string, lastName: string): string {
  return `${name} ${lastName}`
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s._-]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.|\.$/g, "");
}

/** Correo que se guarda para el usuario: `usuario@email.com`. */
export function emailDeUsuario(username: string): string {
  return `${username}@${EMAIL_DOMAIN}`;
}

/**
 * Formulario de nuevo usuario. Si `username` va vacío, el formulario lo genera
 * con `generarUsername` antes de validar, porque el correo se deriva de él.
 * La contraseña sigue la regla de Keystone (mínimo 8 caracteres).
 */
export const nuevoUsuarioSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim(),
  username: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9._-]*$/,
      "Usa solo minúsculas, números, punto, guion o guion bajo, sin espacios",
    ),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z
    .string()
    .regex(/^(\d{10})?$/, "El teléfono debe tener 10 dígitos"),
  role: z.enum(["user", "register", "admin"]),
});

export type NuevoUsuarioFormData = z.infer<typeof nuevoUsuarioSchema>;
