"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  getEncontradoSchema,
  type EncontradoFormData,
} from "registro/lib/validations/encontrado";
import { useActiveEvent } from "registro/contexts/active-event-context";
import {
  ContactForm,
  DiscardChangesModal,
  EditEncontradoModal,
  FormHealthIndicators,
  RegistrosList,
  SexoSelector,
  IdentificationForm,
  useCreateEncontrado,
  ConfirmRegistroModal,
} from "registro/components/dashboard/registro";
import {
  ElegirAsientoModal,
  usePerformCheckin,
} from "registro/components/dashboard/checkin";
import { useAuth } from "registro/hooks/use-auth";
import {
  DEFAULT_CELULAR,
  getStoredSexo,
  PENDING_CHECKIN_RESULT_KEY,
  REGISTRO_SEXO_KEY,
} from "registro/constants/const";
import { routes } from "registro/constants/routes";
import { toast } from "sonner";
import { usePrintGafete } from "registro/components/dashboard/checkin/hooks/use-printer-gafete";

const initialValues: EncontradoFormData = {
  nombre: "",
  apellido_p: "",
  apellido_m: "",
  sexo: "H",
  fecha_n: "",
  estado_c: "",
  religion: "",
  telefono: "",
  address: "",
  nom_ref: "",
  tel_ref: "",
  enfermedad: "",
  celular: DEFAULT_CELULAR,
  medicamento: false,
  user_id: "",
};

function parseFechaN(
  value: string,
): { day: number; month: number; year: number } | null {
  if (!value || value.length < 10) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { day: d, month: m, year: y };
}

/** Orden en que se enfoca el primer campo con error (id del input en el formulario). */
const ERROR_FOCUS_ORDER: [keyof EncontradoFormData, string][] = [
  ["nombre", "nombre"],
  ["apellido_p", "apellido_p"],
  ["fecha_n", "fecha_dia"],
  ["estado_c", "estado_c"],
  ["religion", "religion"],
  ["address", "address"],
  ["nom_ref", "nom_ref"],
  ["tel_ref", "tel_ref"],
];

/**
 * Enfoca el siguiente campo del formulario (Enter avanza como Tab). De un grupo
 * de radios solo cuenta el seleccionado.
 */
function focusNextField(form: HTMLFormElement, current: HTMLElement) {
  const fields = Array.from(
    form.querySelectorAll<HTMLElement>(
      "input:not([type=hidden]):not(:disabled), select:not(:disabled), textarea:not(:disabled)",
    ),
  ).filter(
    (el) => !(el instanceof HTMLInputElement && el.type === "radio" && !el.checked),
  );
  const index = fields.indexOf(current);
  fields[index + 1]?.focus();
}

/** Retorna true si el formulario tiene algún dato (excluyendo sexo). */
function hasFormData(data: EncontradoFormData): boolean {
  return (
    Boolean(data.nombre?.trim()) ||
    Boolean(data.apellido_p?.trim()) ||
    Boolean(data.apellido_m?.trim()) ||
    Boolean(data.fecha_n) ||
    Boolean(data.estado_c?.trim()) ||
    Boolean(data.religion?.trim()) ||
    Boolean(data.telefono?.trim()) ||
    Boolean(data.address?.trim()) ||
    Boolean(data.nom_ref?.trim()) ||
    Boolean(data.tel_ref?.trim()) ||
    Boolean(data.enfermedad?.trim())
  );
}

interface SinLugarEncontrado {
  id: string;
  nombre: string;
  sexo: "H" | "M";
}

export default function DashboardRegistroPage() {
  const [formData, setFormData] = useState<EncontradoFormData>(() => ({
    ...initialValues,
    sexo: getStoredSexo(),
  }));
  const [errors, setErrors] = useState<
    Partial<Record<keyof EncontradoFormData, string>>
  >({});
  const [fechaInputs, setFechaInputs] = useState({
    dia: "",
    mes: "",
    ano: "",
  });
  const [fechaError, setFechaError] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingEncontradoId, setEditingEncontradoId] = useState<string | null>(
    null,
  );
  const [pendingNavigateTo, setPendingNavigateTo] = useState<string | null>(
    null,
  );
  /** Recién registrado sin lugar automático: el usuario elige el asiento en el modal. */
  const [sinLugarEncontrado, setSinLugarEncontrado] =
    useState<SinLugarEncontrado | null>(null);
  const pendingCheckinRef = useRef<SinLugarEncontrado | null>(null);
  const fechaMesRef = useRef<HTMLInputElement>(null);
  const fechaAnoRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const clearFormRef = useRef<(() => void) | null>(null);
  const isRegisterAndCheckinRef = useRef(false);
  const checkinErrorHandledRef = useRef(false);
  const hasData = hasFormData(formData);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { eventType } = useActiveEvent();
  const encontradoSchema = useMemo(
    () => getEncontradoSchema(eventType),
    [eventType],
  );
  const userId = user?.id != null ? String(user.id) : "";

  const handleClearForm = () => {
    if (hasData) {
      setShowDiscardModal(true);
    } else {
      setFormData((prev) => ({
        ...initialValues,
        sexo: prev.sexo,
        user_id: user?.id != null ? String(user.id) : "",
      }));
      setErrors({});
      setFechaInputs({ dia: "", mes: "", ano: "" });
    }
  };
  clearFormRef.current = handleClearForm;

  /** Enfoca un campo del formulario de registro por id (evita ids repetidos en modales). */
  const focusField = (id: string) => {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>(`#${id}`)?.focus();
    });
  };

  const resetFormAfterSave = () => {
    setShowConfirmModal(false);
    setFormData((prev) => ({
      ...initialValues,
      sexo: prev.sexo,
      user_id: userId,
    }));
    setErrors({});
    setFechaInputs({ dia: "", mes: "", ano: "" });
    focusField("nombre");
  };

  const { submitEncontrado, loading } = useCreateEncontrado({
    onSuccess: () => {
      if (!isRegisterAndCheckinRef.current) resetFormAfterSave();
    },
  });

  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  // Con un modal abierto (confirmar, descartar o editar) los atajos de la página
  // se pausan: cada modal maneja los suyos.
  const modalOpenRef = useRef(false);
  modalOpenRef.current =
    showConfirmModal ||
    showDiscardModal ||
    editingEncontradoId != null ||
    sinLugarEncontrado != null;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpenRef.current) return;
      if (
        e.key === "Enter" &&
        (e.ctrlKey || e.metaKey) &&
        !loadingRef.current
      ) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
      if (
        (e.key === "Delete" || e.key === "Backspace" || e.key === "Escape") &&
        (e.ctrlKey || e.metaKey)
      ) {
        e.preventDefault();
        clearFormRef.current?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  const handleCheckinError = () => {
    if (checkinErrorHandledRef.current) return;
    checkinErrorHandledRef.current = true;
    resetFormAfterSave();
    toast.error(
      "Hubo un error al hacer check-in pero el encontrado se registró correctamente. Por favor inténtelo de nuevo en la pestaña Check-in.",
    );
    router.push(routes.dashboardCheckin());
  };

  const { performCheckin, loading: performingCheckin } = usePerformCheckin({
    onSuccess: (result) => {
      if (typeof window !== "undefined" && window.sessionStorage && result) {
        window.sessionStorage.setItem(
          PENDING_CHECKIN_RESULT_KEY,
          JSON.stringify(result),
        );
      }
      setSinLugarEncontrado(null);
      resetFormAfterSave();
      router.push(routes.dashboardCheckin());
    },
    onSinLugar: () => {
      setShowConfirmModal(false);
      setSinLugarEncontrado(pendingCheckinRef.current);
    },
    onError: (err) => {
      // Con el modal abierto (falló el asiento elegido) no se sale de la página.
      if (sinLugarEncontrado) {
        toast.error(err.message ?? "Error al hacer check-in");
        return;
      }
      handleCheckinError();
    },
  });

  /** Cierra el modal sin elegir asiento: el encontrado ya quedó registrado, sin check-in. */
  const handleSinLugarClose = () => {
    const nombre = sinLugarEncontrado?.nombre ?? "";
    setSinLugarEncontrado(null);
    resetFormAfterSave();
    toast.info(
      `Se registró a ${nombre} sin check-in. Hazlo desde la pestaña Check-in cuando elijas lugar.`,
    );
    router.push(routes.dashboardCheckin());
  };

  useEffect(() => {
    if (user?.id == null) return;
    setFormData((prev) => ({
      ...prev,
      user_id: String(user.id),
    }));
  }, [user?.id]);

  useEffect(() => {
    const p = parseFechaN(formData.fecha_n);
    if (!p) return;
    setFechaInputs({
      dia: String(p.day),
      mes: String(p.month),
      ano: String(p.year),
    });
    setFechaError(null);
  }, [formData.fecha_n]);

  useEffect(() => {
    if (!hasData) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasData]);

  useEffect(() => {
    if (!hasData) return;
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href^="/"]');
      if (!link || link.getAttribute("target") === "_blank") return;
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      const targetPath = href.split("?")[0].split("#")[0];
      if (targetPath === pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingNavigateTo(href);
      setShowDiscardModal(true);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [hasData, pathname]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const isSelect = e.target.tagName === "SELECT";
    let nextValue: string | boolean =
      type === "checkbox"
        ? checked
        : type === "date"
          ? value || ""
          : isSelect
            ? value
            : name === "address"
              ? value
              : value.toUpperCase();
    if (
      type !== "checkbox" &&
      type !== "date" &&
      typeof nextValue === "string"
    ) {
      if (name === "telefono" || name === "tel_ref") {
        nextValue = nextValue.replace(/\D/g, "").slice(0, 10);
      }
    }
    setFormData((prev: EncontradoFormData) => ({
      ...prev,
      [name]: nextValue,
    }));
    if (
      name === "sexo" &&
      typeof window !== "undefined" &&
      window.localStorage
    ) {
      window.localStorage.setItem(REGISTRO_SEXO_KEY, String(nextValue));
    }
    if (errors[name as keyof EncontradoFormData]) {
      setErrors((prev: Partial<Record<keyof EncontradoFormData, string>>) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = encontradoSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof EncontradoFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string" && key in initialValues) {
          fieldErrors[key as keyof EncontradoFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      const firstInvalid = ERROR_FOCUS_ORDER.find(([key]) => fieldErrors[key]);
      if (firstInvalid) focusField(firstInvalid[1]);
      return;
    }
    setErrors({});
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    const result = encontradoSchema.safeParse(formData);
    if (!result.success) return;
    await submitEncontrado(result.data);
  };

  const handleConfirmAndCheckin = async () => {
    const result = encontradoSchema.safeParse(formData);
    if (!result.success || !userId) return;
    isRegisterAndCheckinRef.current = true;
    checkinErrorHandledRef.current = false;
    try {
      const created = await submitEncontrado(result.data);
      if (!created?.id) return;
      pendingCheckinRef.current = {
        id: created.id,
        nombre: [result.data.nombre, result.data.apellido_p, result.data.apellido_m]
          .filter(Boolean)
          .join(" "),
        sexo: result.data.sexo === "M" ? "M" : "H",
      };
      await performCheckin(created.id, userId);
    } catch {
      handleCheckinError();
    } finally {
      isRegisterAndCheckinRef.current = false;
    }
  };

  const { PrintGafete, loading: printingGafete } = usePrintGafete();


  const handleConfirmAndPrint = async () => {
    const result = encontradoSchema.safeParse(formData);
    if (!result.success || !userId) return;
    const created = await submitEncontrado(result.data);
    if (!created?.id) return;
    try {
      await PrintGafete(
        formData.nombre,
        formData.sexo + formData.apellido_p,
        formData.apellido_p,
        formData.apellido_m,
        1,
      );
    } catch {
      toast.error("No se pudo abrir la impresión");
    }
  };

  const isHombre = formData.sexo !== "M";
  const kbdClass =
    "rounded border bg-gray-100 px-1 font-mono text-xs shadow-sm dark:border-gray-600 dark:bg-gray-800";

  /** Enter en un campo pasa al siguiente, como Tab; registrar es Ctrl+Enter. */
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (
      e.key !== "Enter" ||
      e.defaultPrevented ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return;
    }
    const target = e.target;
    if (!(target instanceof HTMLInputElement) || target.type === "checkbox") {
      return;
    }
    e.preventDefault();
    focusNextField(e.currentTarget, target);
  };

  return (
    <div className="grid w-full max-w-[110rem] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr),minmax(300px,380px)]">
      <div className="min-w-0">
        {/* La pestaña "Registro" ya titula la vista; el h1 queda para lectores de pantalla. */}
        <h1 className="sr-only">
          Registro de {isHombre ? "encontrado" : "encontrada"}
        </h1>

        {/*
          El formulario es contenedor de consulta: Contacto y Salud se ponen
          lado a lado cuando hay ancho (≥44rem), sin depender de la ventana.
          scroll-mb evita que la barra fija de acciones tape el campo enfocado.
        */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="space-y-6 [container-type:inline-size] [&_input]:scroll-mb-28 [&_select]:scroll-mb-28 [&_textarea]:scroll-mb-28"
        >
          <IdentificationForm
            formData={formData}
            errors={errors}
            fechaInputs={fechaInputs}
            fechaError={fechaError}
            onChange={handleChange}
            onFechaInputsChange={(partial) =>
              setFechaInputs((prev) => ({ ...prev, ...partial }))
            }
            onFechaNChange={(fechaN) =>
              setFormData((prev) => ({ ...prev, fecha_n: fechaN }))
            }
            onFechaError={setFechaError}
            onClearFechaError={() =>
              setErrors((prev) => ({ ...prev, fecha_n: undefined }))
            }
            fechaMesRef={fechaMesRef}
            fechaAnoRef={fechaAnoRef}
            headerAside={
              <SexoSelector
                value={isHombre ? "H" : "M"}
                error={errors.sexo}
                onChange={handleChange}
                label="Sexo"
                compact
              />
            }
          />
          <div className="grid gap-6 [@container(min-width:44rem)]:grid-cols-2">
            <ContactForm
              formData={formData}
              onChange={handleChange}
              errors={errors}
              className="flex flex-col gap-4"
            />
            <FormHealthIndicators
              formData={formData}
              onChange={handleChange}
              className="flex flex-col gap-4"
            />
          </div>

          <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-gray-200 bg-app-surface py-3 sm:flex-row sm:justify-end dark:border-gray-700 dark:bg-[#202124]">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleClearForm}
                className={`w-full rounded-xl border px-5 py-2.5 text-sm font-medium text-app-text-primary transition-colors dark:text-gray-300 dark:hover:bg-gray-800 ${isHombre ? "border-gray-300 hover:bg-app-selected dark:border-gray-600" : "hover:bg-pink-500/10 dark:border-pink-400"}`}
              >
                Limpiar
              </button>
              <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
                <kbd className={kbdClass}>Ctrl</kbd> + (
                <kbd className={kbdClass}>Backspace</kbd> o{" "}
                <kbd className={kbdClass}>ESC</kbd>)
              </span>
            </div>
            <div className="flex flex-col items-center">
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                  isHombre
                    ? "bg-app-primary hover:bg-app-primary/90 focus:ring-app-primary focus:ring-offset-app-surface dark:focus:ring-offset-[#202124]"
                    : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 focus:ring-offset-app-surface dark:focus:ring-offset-[#202124]"
                }`}
              >
                <HugeiconsIcon icon={Add01Icon} size={18} />
                {loading
                  ? "Guardando…"
                  : `Registrar ${isHombre ? "encontrado" : "encontrada"}`}
              </button>
              <span className="mt-1 select-none text-xs text-app-text-secondary dark:text-gray-400">
                <kbd className={kbdClass}>Ctrl</kbd> +{" "}
                <kbd className={kbdClass}>Enter</kbd>
              </span>
            </div>
          </div>
        </form>
      </div>

      <aside className="lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100dvh-7.5rem)] lg:flex-col lg:self-start lg:border-l lg:border-gray-200 lg:pl-8 dark:lg:border-gray-700">
        <RegistrosList
          userId={user?.id}
          onEdit={(id) => setEditingEncontradoId(id)}
          className="lg:flex-1"
        />
      </aside>

      <EditEncontradoModal
        open={editingEncontradoId != null}
        encontradoId={editingEncontradoId}
        userId={user?.id ?? ""}
        onClose={() => setEditingEncontradoId(null)}
        onSaved={() => setEditingEncontradoId(null)}
      />

      <ConfirmRegistroModal
        open={showConfirmModal}
        formData={formData}
        loading={loading || performingCheckin || printingGafete}
        onConfirm={handleConfirmSave}
        onConfirmAndCheckin={handleConfirmAndCheckin}
        onConfirmAndPrint={handleConfirmAndPrint} 
        onCancel={() => setShowConfirmModal(false)}
      />

      <ElegirAsientoModal
        open={sinLugarEncontrado != null}
        encontrado={sinLugarEncontrado}
        onConfirm={(seatId) =>
          sinLugarEncontrado
            ? performCheckin(sinLugarEncontrado.id, userId, null, seatId)
            : Promise.resolve(false)
        }
        confirming={performingCheckin}
        onClose={handleSinLugarClose}
      />

      <DiscardChangesModal
        open={showDiscardModal}
        onClose={() => {
          setShowDiscardModal(false);
          setPendingNavigateTo(null);
        }}
        onConfirmDiscard={() => {
          setFormData((prev) => ({
            ...initialValues,
            sexo: prev.sexo,
            user_id: user?.id != null ? String(user.id) : "",
          }));
          setErrors({});
          setFechaInputs({ dia: "", mes: "", ano: "" });
          setShowDiscardModal(false);
          const to = pendingNavigateTo;
          setPendingNavigateTo(null);
          if (to) router.push(to);
        }}
      />
    </div>
  );
}
