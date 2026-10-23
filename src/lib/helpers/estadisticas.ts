import type { EstadisticaEncontrado } from "registro/graphql/estadisticas/queries";
import type { ConteoPorSexo } from "registro/lib/helpers/aforo-counts";

/** Población sobre la que se calculan las gráficas. */
export type Poblacion = "retiro" | "registrados";

export const SIN_ESPECIFICAR = "Sin especificar";

/** Opciones de estado civil y religión (las mismas de IdentificationForm). */
export const ESTADO_CIVIL_OPCIONES = [
  "Soltero(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viudo(a)",
  "Unión libre",
  "Otro",
] as const;

export const RELIGION_OPCIONES = [
  "Católica",
  "Cristiana",
  "Judía",
  "Testigos de Jehová",
  "Mormona",
  "Sin religión",
  "Otra",
] as const;

/** Rangos de edad alineados con los grupos de edad del seed. */
const RANGOS_EDAD = [
  { nombre: "Menos de 14", min: 0, max: 13 },
  { nombre: "14–17", min: 14, max: 17 },
  { nombre: "18–20", min: 18, max: 20 },
  { nombre: "21–30", min: 21, max: 30 },
  { nombre: "31–40", min: 31, max: 40 },
  { nombre: "41–50", min: 41, max: 50 },
  { nombre: "51–60", min: 51, max: 60 },
  { nombre: "61 o más", min: 61, max: Number.POSITIVE_INFINITY },
];

const HORA_MS = 60 * 60 * 1000;

export interface FilaPorSexo {
  nombre: string;
  hombres: number;
  mujeres: number;
  total: number;
}

function esMujer(e: EstadisticaEncontrado): boolean {
  return e.sexo === "M";
}

/** Total y desglose por sexo de una lista de encontrados. */
export function conteo(lista: EstadisticaEncontrado[]): ConteoPorSexo {
  let mujeres = 0;
  for (const e of lista) if (esMujer(e)) mujeres += 1;
  return { total: lista.length, hombres: lista.length - mujeres, mujeres };
}

/** IDs de encontrados que abandonaron su asiento (bajas). */
export function idsDeBajas(
  bajas: { abandonedBy: { id: string } | null }[],
): Set<string> {
  const ids = new Set<string>();
  for (const seat of bajas) if (seat.abandonedBy?.id) ids.add(seat.abandonedBy.id);
  return ids;
}

/** En el retiro = con check-in y sin baja (igual que el aforo). */
export function estaEnRetiro(e: EstadisticaEncontrado, bajaIds: Set<string>): boolean {
  return Boolean(e.checkins?.checkinAt) && !bajaIds.has(e.id);
}

/** Embudo del evento: registrados, en el retiro, sin check-in y bajas. */
export function resumenEvento(
  encontrados: EstadisticaEncontrado[],
  bajaIds: Set<string>,
) {
  return {
    registrados: conteo(encontrados),
    enRetiro: conteo(encontrados.filter((e) => estaEnRetiro(e, bajaIds))),
    sinCheckin: conteo(encontrados.filter((e) => !e.checkins?.checkinAt)),
    bajas: conteo(encontrados.filter((e) => bajaIds.has(e.id))),
  };
}

/**
 * Cuenta por categoría con desglose H/M. Los valores fuera de `opciones` caen en
 * `otro` y los vacíos en "Sin especificar". Orden: mayor a menor, "Sin especificar"
 * al final; solo categorías con al menos una persona.
 */
export function porCategoria(
  lista: EstadisticaEncontrado[],
  valor: (e: EstadisticaEncontrado) => string | null | undefined,
  opciones: readonly string[],
  otro: string,
): FilaPorSexo[] {
  const filas = new Map<string, FilaPorSexo>();
  for (const e of lista) {
    const raw = valor(e)?.trim();
    const nombre = !raw ? SIN_ESPECIFICAR : opciones.includes(raw) ? raw : otro;
    const fila = filas.get(nombre) ?? { nombre, hombres: 0, mujeres: 0, total: 0 };
    if (esMujer(e)) fila.mujeres += 1;
    else fila.hombres += 1;
    fila.total += 1;
    filas.set(nombre, fila);
  }
  return Array.from(filas.values()).sort((a, b) => {
    if (a.nombre === SIN_ESPECIFICAR) return 1;
    if (b.nombre === SIN_ESPECIFICAR) return -1;
    return b.total - a.total;
  });
}

function promedio(valores: number[]): number | null {
  if (valores.length === 0) return null;
  return Math.round(valores.reduce((s, v) => s + v, 0) / valores.length);
}

/**
 * Distribución por rango de edad (para la pirámide H/M) y edad promedio.
 * "Menos de 14" solo aparece si hay alguien en ese rango.
 */
export function porEdad(lista: EstadisticaEncontrado[]) {
  const filas: FilaPorSexo[] = RANGOS_EDAD.map((r) => ({
    nombre: r.nombre,
    hombres: 0,
    mujeres: 0,
    total: 0,
  }));
  const edadesH: number[] = [];
  const edadesM: number[] = [];
  let sinEdad = 0;

  for (const e of lista) {
    if (e.edad == null || e.edad < 0) {
      sinEdad += 1;
      continue;
    }
    const index = RANGOS_EDAD.findIndex((r) => e.edad! >= r.min && e.edad! <= r.max);
    if (index === -1) continue;
    if (esMujer(e)) {
      filas[index].mujeres += 1;
      edadesM.push(e.edad);
    } else {
      filas[index].hombres += 1;
      edadesH.push(e.edad);
    }
    filas[index].total += 1;
  }

  return {
    filas: filas.filter((f, i) => i !== 0 || f.total > 0),
    sinEdad,
    promedio: {
      total: promedio([...edadesH, ...edadesM]),
      hombres: promedio(edadesH),
      mujeres: promedio(edadesM),
    },
  };
}

/** Lo que importa para la logística: celulares, medicamentos, padecimientos y bautizos. */
export function indicadores(lista: EstadisticaEncontrado[]) {
  return {
    celular: conteo(lista.filter((e) => e.celular)),
    medicamento: conteo(lista.filter((e) => e.medicamento)),
    padecimiento: conteo(lista.filter((e) => Boolean(e.enfermedad?.trim()))),
    bautizados: conteo(lista.filter((e) => e.bautizo)),
  };
}

export interface CubetaHora {
  /** Inicio de la hora (ms, hora local). */
  inicio: number;
  registros: number;
  /** Registros de hombres y de mujeres (suman `registros`). */
  registrosH: number;
  registrosM: number;
  checkins: number;
  /** Check-ins de hombres y de mujeres (suman `checkins`). */
  checkinsH: number;
  checkinsM: number;
}

function inicioDeHora(t: number): number {
  const d = new Date(t);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

/** Momento (ms) de un evento y si fue de una mujer. */
interface EventoHora {
  t: number;
  mujer: boolean;
}

function eventos(
  lista: EstadisticaEncontrado[],
  fecha: (e: EstadisticaEncontrado) => string | null | undefined,
): EventoHora[] {
  const resultado: EventoHora[] = [];
  for (const e of lista) {
    const valor = fecha(e);
    const t = valor ? Date.parse(valor) : Number.NaN;
    if (Number.isFinite(t)) resultado.push({ t, mujer: esMujer(e) });
  }
  return resultado;
}

/**
 * Registros (`create_at`) y check-ins por hora, con su desglose H/M, de la primera a la
 * última hora con actividad, incluidas las horas vacías. Si el periodo pasa de `maxHoras`,
 * se muestran solo las últimas `maxHoras` y `recortado` es `true`.
 */
export function actividadPorHora(
  lista: EstadisticaEncontrado[],
  maxHoras = 48,
): { cubetas: CubetaHora[]; recortado: boolean } {
  const registros = eventos(lista, (e) => e.create_at);
  const checkins = eventos(lista, (e) => e.checkins?.checkinAt);
  const todos = [...registros, ...checkins].map((ev) => ev.t);
  if (todos.length === 0) return { cubetas: [], recortado: false };

  const fin = inicioDeHora(Math.max(...todos));
  let inicio = inicioDeHora(Math.min(...todos));
  let recortado = false;
  if ((fin - inicio) / HORA_MS + 1 > maxHoras) {
    inicio = fin - (maxHoras - 1) * HORA_MS;
    recortado = true;
  }

  const cubetas: CubetaHora[] = [];
  for (let t = inicio; t <= fin; t += HORA_MS) {
    cubetas.push({
      inicio: t,
      registros: 0,
      registrosH: 0,
      registrosM: 0,
      checkins: 0,
      checkinsH: 0,
      checkinsM: 0,
    });
  }
  const cubeta = (t: number): CubetaHora | undefined =>
    cubetas[Math.floor((inicioDeHora(t) - inicio) / HORA_MS)];
  for (const { t, mujer } of registros) {
    const c = cubeta(t);
    if (!c) continue;
    c.registros += 1;
    if (mujer) c.registrosM += 1;
    else c.registrosH += 1;
  }
  for (const { t, mujer } of checkins) {
    const c = cubeta(t);
    if (!c) continue;
    c.checkins += 1;
    if (mujer) c.checkinsM += 1;
    else c.checkinsH += 1;
  }
  return { cubetas, recortado };
}

/** Cada cuántos minutos hay un corte en la gráfica de crecimiento. */
export const INTERVALO_ACUMULADO_MIN = 15;
const INTERVALO_MS = INTERVALO_ACUMULADO_MIN * 60 * 1000;

function inicioDeIntervalo(t: number): number {
  const d = new Date(t);
  const minutos = d.getMinutes();
  d.setMinutes(minutos - (minutos % INTERVALO_ACUMULADO_MIN), 0, 0);
  return d.getTime();
}

/** Acumulado hasta un corte: todo lo que pasó antes de `t`. */
export interface PuntoAcumulado {
  /** Corte (ms, hora local, múltiplo de `INTERVALO_ACUMULADO_MIN`). */
  t: number;
  registros: number;
  registrosH: number;
  registrosM: number;
  checkins: number;
  checkinsH: number;
  checkinsM: number;
}

type CampoAcumulado = Exclude<keyof PuntoAcumulado, "t">;

/**
 * Registros y check-ins acumulados cada `INTERVALO_ACUMULADO_MIN` minutos, con su desglose
 * H/M, para ver cómo crece el evento. El primer corte es el intervalo de la primera
 * actividad y el último, el intervalo siguiente a la última, así que termina en los
 * totales. Si el periodo pasa de `maxHoras`, se muestran solo las últimas `maxHoras`
 * (`recortado`), pero el acumulado sigue contando lo de antes.
 */
export function acumuladoPorIntervalo(
  lista: EstadisticaEncontrado[],
  maxHoras = 48,
): { puntos: PuntoAcumulado[]; recortado: boolean } {
  const registros = eventos(lista, (e) => e.create_at);
  const checkins = eventos(lista, (e) => e.checkins?.checkinAt);
  const todos = [...registros, ...checkins].map((ev) => ev.t);
  if (todos.length === 0) return { puntos: [], recortado: false };

  const fin = inicioDeIntervalo(Math.max(...todos)) + INTERVALO_MS;
  let inicio = inicioDeIntervalo(Math.min(...todos));
  let recortado = false;
  const maxIntervalos = (maxHoras * 60) / INTERVALO_ACUMULADO_MIN;
  if ((fin - inicio) / INTERVALO_MS > maxIntervalos) {
    inicio = fin - maxIntervalos * INTERVALO_MS;
    recortado = true;
  }

  const n = Math.round((fin - inicio) / INTERVALO_MS);
  const puntos: PuntoAcumulado[] = Array.from({ length: n + 1 }, (_, k) => ({
    t: inicio + k * INTERVALO_MS,
    registros: 0,
    registrosH: 0,
    registrosM: 0,
    checkins: 0,
    checkinsH: 0,
    checkinsM: 0,
  }));

  // Cada evento suma en el primer corte posterior a él (lo anterior a `inicio`, en el 0);
  // después se acumula de corte en corte.
  const sumar = (
    lista: EventoHora[],
    total: CampoAcumulado,
    hombres: CampoAcumulado,
    mujeres: CampoAcumulado,
  ) => {
    for (const { t, mujer } of lista) {
      const k = Math.max(0, Math.floor((t - inicio) / INTERVALO_MS) + 1);
      const p = puntos[Math.min(k, n)];
      p[total] += 1;
      p[mujer ? mujeres : hombres] += 1;
    }
  };
  sumar(registros, "registros", "registrosH", "registrosM");
  sumar(checkins, "checkins", "checkinsH", "checkinsM");

  const campos: CampoAcumulado[] = [
    "registros",
    "registrosH",
    "registrosM",
    "checkins",
    "checkinsH",
    "checkinsM",
  ];
  for (let k = 1; k <= n; k++) {
    for (const campo of campos) puntos[k][campo] += puntos[k - 1][campo];
  }
  return { puntos, recortado };
}

/** "12 %" de `parte` sobre `total`; "—" si no hay total. */
export function porcentaje(parte: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((parte / total) * 100)} %`;
}
