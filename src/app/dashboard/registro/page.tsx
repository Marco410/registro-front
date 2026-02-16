"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  encontradoSchema,
  type EncontradoFormData,
} from "registro/lib/validations/encontrado";
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
import { useAuth } from "registro/hooks/use-auth";

const initialValues: EncontradoFormData = {
  nombre: "",
  apellido_p: "",
  apellido_m: "",
  sexo:
    typeof window !== "undefined" && typeof localStorage !== "undefined"
      ? localStorage.getItem("registro_sexo") === "M"
        ? "M"
        : "H"
      : "H",
  fecha_n: "",
  estado_c: "",
  religion: "",
  telefono: "",
  nom_ref: "",
  tel_ref: "",
  enfermedad: "",
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
    Boolean(data.nom_ref?.trim()) ||
    Boolean(data.tel_ref?.trim()) ||
    Boolean(data.enfermedad?.trim())
  );
}

export default function DashboardRegistroPage() {
  const [formData, setFormData] = useState<EncontradoFormData>(initialValues);
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
  const hasData = hasFormData(formData);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const { submitEncontrado, loading } = useCreateEncontrado({
    onSuccess: () => {
      setShowConfirmModal(false);
      setFormData((prev) => ({
        ...initialValues,
        sexo: prev.sexo,
        user_id: user?.id != null ? String(user.id) : "",
      }));
      setErrors({});
      setFechaInputs({ dia: "", mes: "", ano: "" });
    },
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
    let nextValue: string | boolean =
      type === "checkbox" ? checked : type === "date" ? value || "" : value;
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
      window.localStorage.setItem("registro_sexo", String(nextValue));
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

  return (
    <div className="w-full max-w-7xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
            Registro de encontrado
          </h1>
          <SexoSelector
            value={formData.sexo === "M" ? "M" : "H"}
            error={errors.sexo}
            onChange={handleChange}
          />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
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

          <div className="flex flex-col gap-6">
            <ContactForm
              formData={formData}
              onChange={handleChange}
              errors={errors}
              className="flex flex-col gap-6"
            />
            <FormHealthIndicators
              formData={formData}
              onChange={handleChange}
              className="flex flex-col gap-6"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
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
            }}
            className={`rounded-xl border px-5 py-2.5 text-sm font-medium text-app-text-primary transition-colors dark:text-gray-300 dark:hover:bg-gray-800 ${formData.sexo === "H" ? "border-gray-300 hover:bg-app-selected dark:border-gray-600" : "hover:bg-pink-500/10 dark:border-pink-400"}`}
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
              formData.sexo === "H"
                ? "bg-app-primary hover:bg-app-primary/90 focus:ring-app-primary focus:ring-offset-2 focus:ring-offset-app-surface dark:focus:ring-offset-[#202124]"
                : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-app-surface dark:focus:ring-offset-[#202124]"
            }`}
          >
            <HugeiconsIcon icon={Add01Icon} size={18} />
            {loading
              ? "Guardando…"
              : `Registrar ${formData.sexo === "H" ? "encontrado" : "encontrada"} `}
          </button>
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
        loading={loading}
        onConfirm={handleConfirmSave}
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
