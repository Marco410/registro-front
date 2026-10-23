"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  ENCONTRADO_DETALLE_QUERY,
  type EncontradoDetalle,
  type EncontradoDetalleResponse,
  type EncontradoDetalleVariables,
} from "registro/graphql/encontrados/queries";
import {
  displayEdad,
  displayValue,
  formatFechaDisplay,
} from "registro/lib/helpers/encontrado-display";
import { useIsNinosEvent } from "registro/contexts/active-event-context";
import { GlassModal } from "registro/components/shared/GlassModal";
import { copyToClipboard } from "registro/lib/clipboard";

/** `copiar`: texto que copia el botón junto al valor (por ejemplo, un teléfono). */
type Fila = { label: string; value: string; copiar?: { texto: string; nombre: string } };

/** Si hay valor, la fila lleva botón para copiarlo. */
function copiable(valor: string | null | undefined, nombre: string) {
  const texto = valor?.trim();
  return texto ? { texto, nombre } : undefined;
}

/** Botón chico para copiar al portapapeles; muestra una palomita un momento al copiar. */
function BotonCopiar({ texto, nombre }: { texto: string; nombre: string }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const id = setTimeout(() => setCopiado(false), 1500);
    return () => clearTimeout(id);
  }, [copiado]);

  const copiar = async () => {
    if (await copyToClipboard(texto)) {
      setCopiado(true);
      toast.success(`${nombre} copiado`);
    } else {
      toast.error(`No se pudo copiar el ${nombre.toLowerCase()}`);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copiar()}
      aria-label={`Copiar ${nombre.toLowerCase()}`}
      title="Copiar"
      className="-my-1 shrink-0 rounded-md p-1 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <HugeiconsIcon icon={copiado ? Tick02Icon : Copy01Icon} size={14} />
    </button>
  );
}

/** Espacios que no se parten: "p. m." o "23 oct 2026" nunca quedan en dos renglones. */
const sinCortes = (texto: string) => texto.replace(/\s/g, "\u00a0");

/** "23 oct 2026, 2:50 p. m."; si no cabe, solo se parte después de la coma. */
function formatFechaHora(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  const fecha = d.toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("es", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${sinCortes(fecha)}, ${sinCortes(hora)}`;
}

const siNo = (v: boolean | null | undefined) => (v ? "Sí" : "No");

/**
 * Agrupa los datos del encontrado: su lugar en el retiro, datos personales, contacto de
 * emergencia, salud y el registro. Los datos dependen del evento, como en el formulario:
 * en niños, dirección; en retiro, estado civil, religión y teléfono (y dirección si la hay).
 */
function buildGrupos(
  e: EncontradoDetalle,
  isNinosEvent: boolean,
): { title: string; rows: Fila[] }[] {
  const c = e.checkins;
  const retiro: Fila[] = c
    ? [
        { label: "Asiento", value: displayValue(c.clave ?? undefined) },
        { label: "Equipo", value: displayValue(c.team?.teamName) },
        { label: "Grupo de edad", value: displayValue(c.ageGroup?.label) },
        { label: "Check-in", value: formatFechaHora(c.checkinAt) },
        { label: "Lo hizo", value: displayValue(c.user?.name ?? undefined) },
        ...(c.claveOld ? [{ label: "Asiento anterior", value: c.claveOld }] : []),
        { label: "Bautizado", value: siNo(e.bautizo) },
      ]
    : [
        { label: "Check-in", value: "Sin check-in" },
        { label: "Bautizado", value: siNo(e.bautizo) },
      ];

  const datos: Fila[] = isNinosEvent
    ? [{ label: "Dirección", value: displayValue(e.address ?? undefined) }]
    : [
        { label: "Estado civil", value: displayValue(e.estado_c ?? undefined) },
        { label: "Religión", value: displayValue(e.religion ?? undefined) },
        {
          label: "Teléfono",
          value: displayValue(e.telefono ?? undefined),
          copiar: copiable(e.telefono, "Teléfono"),
        },
        ...(e.address?.trim() ? [{ label: "Dirección", value: e.address.trim() }] : []),
      ];

  return [
    { title: "En el retiro", rows: retiro },
    { title: "Datos", rows: datos },
    {
      title: "Contacto de emergencia",
      rows: [
        { label: "Nombre", value: displayValue(e.nom_ref ?? undefined) },
        {
          label: "Teléfono",
          value: displayValue(e.tel_ref ?? undefined),
          copiar: copiable(e.tel_ref, "Teléfono de emergencia"),
        },
      ],
    },
    {
      title: "Salud",
      rows: [
        { label: "Enfermedad", value: displayValue(e.enfermedad ?? undefined) },
        { label: "Celular", value: siNo(e.celular) },
        { label: "Medicamento", value: siNo(e.medicamento) },
      ],
    },
    {
      title: "Registro",
      rows: [
        { label: "Clave", value: e.clave != null ? String(e.clave) : "N/A" },
        { label: "Registró", value: displayValue(e.user?.name ?? undefined) },
        { label: "Fecha", value: formatFechaHora(e.create_at) },
      ],
    },
  ];
}

export interface DetalleEncontradoModalProps {
  open: boolean;
  encontradoId: string;
  onClose: () => void;
}

/**
 * Modal de solo lectura con todos los datos de un encontrado (se abre desde el menú del
 * asiento en Aforo con "Ver detalle"). Lee los datos al abrir para mostrarlos al día.
 */
export function DetalleEncontradoModal({
  open,
  encontradoId,
  onClose,
}: DetalleEncontradoModalProps) {
  const isNinosEvent = useIsNinosEvent();
  const { data, loading, error } = useQuery<
    EncontradoDetalleResponse,
    EncontradoDetalleVariables
  >(ENCONTRADO_DETALLE_QUERY, {
    variables: { id: encontradoId },
    skip: !open,
    fetchPolicy: "network-only",
  });
  const e = data?.encontrado ?? null;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const nombreCompleto = e
    ? [e.nombre, e.apellido_p, e.apellido_m]
        .map((p) => (p ?? "").trim())
        .filter(Boolean)
        .join(" ") || "Sin nombre"
    : "";
  const esHombre = e?.sexo !== "M";
  const resumen = e
    ? [
        esHombre ? "Hombre" : "Mujer",
        e.fecha_n ? displayEdad(e.fecha_n) : e.edad != null ? `${e.edad} años` : "N/A",
        e.fecha_n ? `Nació el ${formatFechaDisplay(e.fecha_n)}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="detalle-encontrado-title"
      panelClassName="max-w-5xl max-h-[min(94vh,calc(100dvh-2rem))] overflow-y-auto overscroll-contain p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id="detalle-encontrado-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          Detalle del encontrado
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-app-primary/50 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>
      </div>

      {loading && !data ? (
        <div className="mt-4 space-y-3" aria-hidden>
          <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : error || !e ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-app-text-secondary dark:border-gray-600 dark:text-gray-400">
          {error ? "No se pudieron cargar los datos del encontrado." : "No se encontró al encontrado."}
        </p>
      ) : (
        <div className="mt-4 rounded-xl bg-white/70 p-4 ring-1 ring-gray-200/80 dark:bg-black/20 dark:ring-white/10">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-xl font-semibold tracking-tight ${
                  esHombre
                    ? "text-app-primary dark:text-app-primary-muted"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {nombreCompleto}
              </p>
              <p className="mt-0.5 text-sm tabular-nums text-app-text-secondary dark:text-gray-400">
                {resumen}
              </p>
            </div>
            {e.checkins?.clave ? (
              <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-semibold tabular-nums text-app-text-primary dark:bg-white/10 dark:text-gray-100">
                {e.checkins.clave}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-x-8 gap-y-5 border-t border-gray-200 pt-4 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-3">
            {buildGrupos(e, isNinosEvent).map((grupo) => (
              <section key={grupo.title}>
                <h3 className="text-xs font-semibold text-app-text-primary dark:text-gray-200">
                  {grupo.title}
                </h3>
                <dl className="mt-2 space-y-1.5">
                  {grupo.rows.map(({ label, value, copiar }) => (
                    <div key={label} className="flex justify-between gap-3 text-sm">
                      <dt className="shrink-0 text-app-text-secondary dark:text-gray-400">
                        {label}
                      </dt>
                      <dd className="flex min-w-0 items-center justify-end gap-1 break-words text-right font-medium tabular-nums text-app-text-primary dark:text-white">
                        {value}
                        {copiar ? <BotonCopiar {...copiar} /> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>

          {e.notes?.trim() ? (
            <section className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-app-text-primary dark:text-gray-200">
                Notas
              </h3>
              <p className="mt-1.5 whitespace-pre-line text-sm text-app-text-primary dark:text-gray-200">
                {e.notes.trim()}
              </p>
            </section>
          ) : null}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cerrar
        </button>
      </div>
    </GlassModal>
  );
}
