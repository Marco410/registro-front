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
import { usePerformCheckin } from "registro/components/dashboard/checkin";
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
import { AnimatedMount } from "registro/components/shared";

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

  const resetFormAfterSave = () => {
    setShowConfirmModal(false);
    setFormData((prev) => ({
      ...initialValues,
      sexo: prev.sexo,
      user_id: userId,
    }));
    setErrors({});
    setFechaInputs({ dia: "", mes: "", ano: "" });
  };

  const { submitEncontrado, loading } = useCreateEncontrado({
    onSuccess: () => {
      if (!isRegisterAndCheckinRef.current) resetFormAfterSave();
    },
  });

  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      resetFormAfterSave();
      router.push(routes.dashboardCheckin());
    },
    onError: handleCheckinError,
  });

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
    console.log("created");
    console.log(created);
    console.log("formData");
    console.log(formData);
    console.log("result");
    console.log(result);
    try {
      await PrintGafete(formData.nombre, formData.sexo + formData.apellido_p, "S/E", 1);
    } catch {
      toast.error("No se pudo abrir la impresión");
    }
  };

  const pageAccent =
    formData.sexo === "M"
      ? "border-pink-500 dark:border-pink-400"
      : "border-app-primary";

  return (
    <div className="w-full max-w-7xl">
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className={`border-l-4 pl-4 ${pageAccent}`}>
            <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
              Registro de encontrado
            </h1>
            <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
              Completa los datos del encontrado para registrarlo.
            </p>
          </div>
          <SexoSelector
            value={formData.sexo === "M" ? "M" : "H"}
            error={errors.sexo}
            onChange={handleChange}
          />
        </div>
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <AnimatedMount
              show
              animationKey={'identification-form'}
              className="space-y-6"
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
            />
          </AnimatedMount>
          <div className="flex flex-col gap-6">
            <AnimatedMount
              show
              animationKey={'contact-form'}
              className="space-y-6"
            >
              <ContactForm
                formData={formData}
                onChange={handleChange}
                errors={errors}
                className="flex flex-col gap-6"
              />
            </AnimatedMount>
            <AnimatedMount
              show
              animationKey={'health-indicators-form'}
              className="space-y-6"
            >
              <FormHealthIndicators
                formData={formData}
                onChange={handleChange}
                className="flex flex-col gap-6"
              />
            </AnimatedMount>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleClearForm}
              className={`w-full rounded-xl border px-5 py-2.5 text-sm font-medium text-app-text-primary transition-colors dark:text-gray-300 dark:hover:bg-gray-800 ${formData.sexo === "H" ? "border-gray-300 hover:bg-app-selected dark:border-gray-600" : "hover:bg-pink-500/10 dark:border-pink-400"}`}
            >
              Limpiar
            </button>
            <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
              <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">
                Ctrl
              </kbd>{" "}
              + (
              <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">
                Backspace
              </kbd>{" "}
              o{" "}
              <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">
                ESC
              </kbd>
              )
            </span>
          </div>
          <div className="flex flex-col items-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                formData.sexo === "H"
                  ? "bg-app-primary hover:bg-app-primary/90 focus:ring-app-primary focus:ring-offset-2 focus:ring-offset-app-surface dark:focus:ring-offset-[#202124]"
                  : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-app-surface dark:focus:ring-offset-[#202124]"
              }`}
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
              {loading
                ? "Guardando…"
                : `Registrar ${
                    formData.sexo === "H" ? "encontrado" : "encontrada"
                  } `}
            </button>
            <span className="mt-1 text-xs text-app-text-secondary dark:text-gray-400 select-none">
              <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="px-1 bg-gray-100 rounded border text-xs shadow-sm font-mono dark:bg-gray-800 dark:border-gray-600">
                Enter
              </kbd>
            </span>
          </div>
        </div>
      </form>

      <div
        className="my-8 h-px w-full bg-gray-200 dark:bg-gray-700"
        role="separator"
        aria-orientation="horizontal"
      />

      <div className="flex flex-col gap-6 mt-6">
        <RegistrosList
          userId={user?.id}
          onEdit={(id) => setEditingEncontradoId(id)}
        />
      </div>

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
        loading={loading || performingCheckin}
        onConfirm={handleConfirmSave}
        onConfirmAndCheckin={handleConfirmAndCheckin}
        onConfirmAndPrint={handleConfirmAndPrint} 
        onCancel={() => setShowConfirmModal(false)}
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
