import {
  CalendarCheckIn01Icon,
  CalendarLock02Icon,
  ClipboardIcon,
  DatabaseIcon,
  SeatSelectorIcon,
  SquareLock01Icon,
  UserSearch01Icon,
} from "@hugeicons/core-free-icons";
import { formatFechaDisplay } from "registro/lib/helpers/encontrado-display";
import { formatDateTime } from "registro/lib/helpers/date-format";

export type AuditCategoria =
  | "sesion"
  | "registro"
  | "checkin"
  | "aforo"
  | "eventos"
  | "usuarios"
  | "sistema";

/** Categorías de acciones, con el mismo icono que su sección en el sidebar. */
export const AUDIT_CATEGORIAS: Record<
  AuditCategoria,
  { label: string; icon: typeof ClipboardIcon; badgeClass: string }
> = {
  sesion: {
    label: "Sesión",
    icon: SquareLock01Icon,
    badgeClass:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  registro: {
    label: "Registro",
    icon: ClipboardIcon,
    badgeClass:
      "bg-app-selected text-app-primary dark:bg-app-primary/20 dark:text-app-primary-muted",
  },
  checkin: {
    label: "Check-in",
    icon: CalendarCheckIn01Icon,
    badgeClass:
      "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  aforo: {
    label: "Aforo",
    icon: SeatSelectorIcon,
    badgeClass:
      "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  eventos: {
    label: "Eventos",
    icon: CalendarLock02Icon,
    badgeClass:
      "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  usuarios: {
    label: "Usuarios",
    icon: UserSearch01Icon,
    badgeClass:
      "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  sistema: {
    label: "Base de datos",
    icon: DatabaseIcon,
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

/**
 * Acciones de la bitácora (mismos valores que `AuditLog.action` en el backend,
 * `models/AuditLog/constants.ts`).
 */
export const AUDIT_ACTIONS: Record<
  string,
  { label: string; categoria: AuditCategoria }
> = {
  sesion_iniciada: { label: "Inició sesión", categoria: "sesion" },
  sesion_fallida: { label: "Intento de sesión fallido", categoria: "sesion" },
  sesion_cerrada: { label: "Cerró sesión", categoria: "sesion" },
  sesiones_revocadas: {
    label: "Cerró la sesión de un usuario",
    categoria: "sesion",
  },
  encontrado_creado: { label: "Registró encontrado", categoria: "registro" },
  encontrado_editado: { label: "Editó encontrado", categoria: "registro" },
  encontrado_eliminado: { label: "Eliminó encontrado", categoria: "registro" },
  checkin_realizado: { label: "Hizo check-in", categoria: "checkin" },
  checkin_editado: { label: "Editó check-in", categoria: "checkin" },
  checkin_eliminado: { label: "Quitó check-in", categoria: "checkin" },
  asiento_reasignado: { label: "Reasignó asiento", categoria: "aforo" },
  asiento_baja: { label: "Dio de baja un asiento", categoria: "aforo" },
  asiento_creado: { label: "Creó asiento", categoria: "aforo" },
  asiento_editado: { label: "Editó asiento", categoria: "aforo" },
  asiento_eliminado: { label: "Eliminó asiento", categoria: "aforo" },
  equipo_creado: { label: "Creó equipo", categoria: "aforo" },
  equipo_editado: { label: "Editó equipo", categoria: "aforo" },
  equipo_eliminado: { label: "Eliminó equipo", categoria: "aforo" },
  equipos_reordenados: { label: "Reordenó equipos", categoria: "aforo" },
  bautizo_aplicado: { label: "Aplicó bautizo", categoria: "aforo" },
  bautizo_retirado: { label: "Quitó bautizo", categoria: "aforo" },
  bautizo_foraneo_creado: { label: "Registró bautizo foráneo", categoria: "aforo" },
  bautizo_foraneo_editado: { label: "Editó bautizo foráneo", categoria: "aforo" },
  bautizo_foraneo_eliminado: { label: "Eliminó bautizo foráneo", categoria: "aforo" },
  grupo_edad_creado: { label: "Creó grupo de edad", categoria: "aforo" },
  grupo_edad_editado: { label: "Editó grupo de edad", categoria: "aforo" },
  grupo_edad_eliminado: { label: "Eliminó grupo de edad", categoria: "aforo" },
  evento_creado: { label: "Creó evento", categoria: "eventos" },
  evento_editado: { label: "Editó evento", categoria: "eventos" },
  evento_activado: { label: "Activó evento", categoria: "eventos" },
  evento_eliminado: { label: "Eliminó evento", categoria: "eventos" },
  usuario_creado: { label: "Creó usuario", categoria: "usuarios" },
  usuario_editado: { label: "Editó usuario", categoria: "usuarios" },
  usuario_eliminado: { label: "Eliminó usuario", categoria: "usuarios" },
  grupos_edad_restaurados: {
    label: "Creó los grupos de edad del seed",
    categoria: "sistema",
  },
  equipos_generados: { label: "Generó equipos y asientos", categoria: "sistema" },
  base_limpiada: { label: "Limpió la base de datos", categoria: "sistema" },
};

/** Datos de una acción; las desconocidas (agregadas en el backend después) caen en Sesión con su valor crudo. */
export function getAuditAction(action: string) {
  return AUDIT_ACTIONS[action] ?? { label: action, categoria: "sesion" as const };
}

/** Valores de acción de una categoría, para el filtro. */
export function actionsOfCategoria(categoria: AuditCategoria): string[] {
  return Object.entries(AUDIT_ACTIONS)
    .filter(([, a]) => a.categoria === categoria)
    .map(([value]) => value);
}

/** Etiquetas de los campos que aparecen en `changes` y `metadata.registroEliminado`. */
export const FIELD_LABELS: Record<string, string> = {
  // Encontrado y bautizo foráneo
  clave: "Clave",
  nombre: "Nombre",
  apellido_p: "Apellido paterno",
  apellido_m: "Apellido materno",
  sexo: "Sexo",
  fecha_n: "Fecha de nacimiento",
  address: "Dirección",
  estado_c: "Estado civil",
  religion: "Religión",
  telefono: "Teléfono",
  nom_ref: "Contacto de emergencia",
  tel_ref: "Teléfono de emergencia",
  enfermedad: "Enfermedad",
  bautizo: "Bautizo",
  celular: "¿Tiene celular?",
  medicamento: "¿Tiene medicamento?",
  notes: "Notas",
  user: "Registrado por",
  gender: "Sexo",
  // Asiento
  letter: "Letra",
  occupied: "Ocupado",
  abandoned: "Dado de baja",
  abandonedBy: "Dado de baja (encontrado)",
  encontrado: "Encontrado",
  team: "Equipo",
  // Equipo
  teamNumber: "Número de equipo",
  teamName: "Nombre del equipo",
  status: "Estado",
  captain: "Capitana",
  auxiliar1: "Auxiliar 1 (mujeres)",
  auxiliar2: "Auxiliar 2 (mujeres)",
  auxiliar3: "Auxiliar 3 (mujeres)",
  auxiliar4: "Auxiliar 4 (mujeres)",
  captain_h: "Capitán",
  auxiliar1_h: "Auxiliar 1 (hombres)",
  auxiliar2_h: "Auxiliar 2 (hombres)",
  auxiliar3_h: "Auxiliar 3 (hombres)",
  auxiliar4_h: "Auxiliar 4 (hombres)",
  order: "Orden",
  ageGroup: "Grupo de edad",
  // Check-in
  seat: "Asiento",
  claveOld: "Clave anterior",
  // Evento
  name: "Nombre",
  description: "Descripción",
  active: "Activo",
  type: "Tipo",
  // Usuario
  lastName: "Apellido",
  secondLastName: "Segundo apellido",
  username: "Usuario",
  email: "Correo",
  phone: "Teléfono",
  password: "Contraseña",
  roles: "Roles",
  // Grupo de edad
  label: "Nombre",
  minAge: "Edad mínima",
  maxAge: "Edad máxima",
  maxTeams: "Máximo de equipos",
};

/** Etiquetas de las claves de `metadata`. */
export const METADATA_LABELS: Record<string, string> = {
  asiento: "Asiento",
  equipo: "Equipo",
  grupoEdad: "Grupo de edad",
  sinLugar: "Sin lugar disponible",
  asientoElegido: "Asiento elegido a mano",
  yaTeniaCheckin: "Ya tenía check-in",
  asientoAnterior: "Asiento anterior",
  asientoNuevo: "Asiento nuevo",
  eventosDesactivados: "Eventos desactivados",
  usuarioInexistente: "El usuario no existe",
  registroEliminado: "Datos del registro eliminado",
};

export const fieldLabel = (key: string) => FIELD_LABELS[key] ?? key;
export const metadataLabel = (key: string) => METADATA_LABELS[key] ?? key;

const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** Texto legible de un valor de `changes` o `metadata`. */
export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (value === true) return "Sí";
  if (value === false) return "No";
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map(formatAuditValue).join(", ") : "—";
  }
  if (typeof value === "string") {
    if (DAY_ONLY.test(value)) return formatFechaDisplay(value);
    if (ISO_DATETIME.test(value)) return formatDateTime(value);
    return value;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
