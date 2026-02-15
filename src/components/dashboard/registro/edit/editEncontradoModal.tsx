"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import type { EncontradoFormData } from "registro/lib/validations/encontrado";
import { encontradoSchema } from "registro/lib/validations/encontrado";
import {
  ENCONTRADO_BY_ID_QUERY,
  type EncontradoByIdQueryResponse,
  type EncontradoByIdQueryVariables,
  type EncontradoListItem,
} from "registro/graphql/encontrados/queries";
import { ContactForm } from "registro/components/dashboard/registro/forms/contactForm";
import { FormHealthIndicators } from "registro/components/dashboard/registro/forms/formHealth";
import {
  type FechaInputs,
  IdentificationForm,
} from "../forms/identificationForm";
import { SexoSelector } from "registro/components/shared";
import { useUpdateEncontrado } from "../hooks";

function parseFechaN(
  value: string,
): { day: number; month: number; year: number } | null {
  if (!value || value.length < 10) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { day: d, month: m, year: y };
}

function encontradoToFormData(
  e: EncontradoListItem,
  userId: string,
): EncontradoFormData {
  return {
    nombre: e.nombre ?? "",
    apellido_p: e.apellido_p ?? "",
    apellido_m: e.apellido_m ?? "",
    sexo: e.sexo ?? "H",
    fecha_n: e.fecha_n ?? "",
    estado_c: e.estado_c ?? "",
    telefono: e.telefono ?? "",
    nom_ref: e.nom_ref ?? "",
    tel_ref: e.tel_ref ?? "",
    enfermedad: e.enfermedad ?? "",
    user_id: e.user?.id ?? userId,
  };
}

export interface EditEncontradoModalProps {
  open: boolean;
  encontradoId: string | null;
  userId: string;
  onClose: () => void;
  onSaved?: () => void;
}

const emptyFormData: EncontradoFormData = {
  nombre: "",
  apellido_p: "",
  apellido_m: "",
  sexo: "H",
  fecha_n: "",
  estado_c: "",
  telefono: "",
  nom_ref: "",
  tel_ref: "",
  enfermedad: "",
  user_id: "",
};

export function EditEncontradoModal({
  open,
  encontradoId,
  userId,
  onClose,
  onSaved,
}: EditEncontradoModalProps) {
  const [formData, setFormData] = useState<EncontradoFormData>(emptyFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EncontradoFormData, string>>
  >({});
  const [fechaInputs, setFechaInputs] = useState<FechaInputs>({
    dia: "",
    mes: "",
    ano: "",
  });
  const [fechaError, setFechaError] = useState<string | null>(null);
  const fechaMesRef = useRef<HTMLInputElement>(null);
  const fechaAnoRef = useRef<HTMLInputElement>(null);

  const { submitUpdate, loading: updateLoading } = useUpdateEncontrado({
    onSuccess: () => {
      onSaved?.();
      onClose();
    },
  });

  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery<EncontradoByIdQueryResponse, EncontradoByIdQueryVariables>(
    ENCONTRADO_BY_ID_QUERY,
    {
      variables: { where: { id: encontradoId ?? "" } },
      skip: !open || !encontradoId,
    },
  );

  const encontrado = data?.encontrado ?? null;

  useEffect(() => {
    if (!open || !encontradoId) return;
    setFormData(emptyFormData);
    setFechaInputs({ dia: "", mes: "", ano: "" });
    setErrors({});
    setFechaError(null);
  }, [encontradoId, open]);

  useEffect(() => {
    if (!encontrado) return;
    const next = encontradoToFormData(encontrado, userId);
    setFormData(next);
    const p = parseFechaN(next.fecha_n);
    if (p) {
      setFechaInputs({
        dia: String(p.day),
        mes: String(p.month),
        ano: String(p.year),
      });
      setFechaError(null);
    } else {
      setFechaInputs({ dia: "", mes: "", ano: "" });
    }
    setErrors({});
  }, [encontrado, userId]);

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
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name as keyof EncontradoFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, user_id: userId };
    const result = encontradoSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof EncontradoFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === "string" && key in emptyFormData) {
          fieldErrors[key as keyof EncontradoFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (!encontradoId) return;
    await submitUpdate(encontradoId, { ...formData, user_id: userId });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-gray-200 bg-app-sidebar shadow-xl dark:border-gray-700 dark:bg-[#202124]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2
            id="edit-modal-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            Editar registro
          </h2>
        </div>

        {queryLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-app-text-secondary dark:text-gray-400">
              Cargando…
            </p>
          </div>
        ) : queryError ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al cargar el registro
            </p>
          </div>
        ) : !encontrado ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-app-text-secondary dark:text-gray-400">
              No se encontró el registro
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-6 w-min">
                <SexoSelector
                  value={formData.sexo === "M" ? "M" : "H"}
                  error={errors.sexo}
                  onChange={handleChange}
                  label="Sexo"
                />
              </div>
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
                    className="flex flex-col gap-6"
                  />
                  <FormHealthIndicators
                    formData={formData}
                    onChange={handleChange}
                    className="flex flex-col gap-6"
                  />
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-60 ${
                  formData.sexo === "H"
                    ? "bg-app-primary hover:bg-app-primary/90"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {updateLoading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
