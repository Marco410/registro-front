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

/**
 * Formulario de nuevo usuario. `username` es opcional: si va vacío, el backend
 * lo genera con nombre y apellido. La contraseña sigue la regla de Keystone
 * (mínimo 8 caracteres).
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
