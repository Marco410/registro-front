"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserEdit01Icon } from "@hugeicons/core-free-icons";
import {
  SEATS_QUERY,
  type SeatEncontrado,
} from "registro/graphql/aforo/queries";
import { UPDATE_ENCONTRADO_MUTATION } from "registro/components/dashboard/registro/mutations";
import { GlassModal } from "registro/components/shared/GlassModal";

export type BautizoAccion = "aplicar" | "quitar";

function getNombreCompleto(e: SeatEncontrado | null): string {
  if (!e) return "";
  return [e.nombre, e.apellido_p, e.apellido_m]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export interface ConfirmarBautizoModalProps {
  open: boolean;
  accion: BautizoAccion;
  encontrado: SeatEncontrado | null;
  onSuccess: () => void;
  onCancel: () => void;
  zIndex?: 50 | 60 | 70;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted uppercase";

export function ConfirmarBautizoModal({
  open,
  accion,
  encontrado,
  onSuccess,
  onCancel,
  zIndex = 50,
}: ConfirmarBautizoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido_p: "",
    apellido_m: "",
    telefono: "",
  });

  const encontradoId = encontrado?.id ?? "";
  const nombreCompleto = getNombreCompleto(encontrado);
  const telefonoDisplay = (encontrado?.telefono ?? "").toString().trim();

  const [updateBautizo, { loading }] = useMutation(UPDATE_ENCONTRADO_MUTATION, {
    refetchQueries: [{ query: SEATS_QUERY }],
  });

  const [updateEncontrado, { loading: savingEdit }] = useMutation(
    UPDATE_ENCONTRADO_MUTATION,
    { refetchQueries: [{ query: SEATS_QUERY }] },
  );

  useEffect(() => {
    if (open) setIsEditing(false);
  }, [open]);

  const isAplicar = accion === "aplicar";
  const loadingAny = loading || savingEdit;

  const handleConfirm = async () => {
    if (!encontradoId) return;
    try {
      await updateBautizo({
        variables: {
          where: { id: encontradoId },
          data: { bautizo: isAplicar },
        },
      });
      toast.success(
        isAplicar ? "Bautizo aplicado con éxito" : "Bautizo removido con éxito",
      );
      onSuccess();
    } catch {}
  };

  const startEditing = () => {
    setForm({
      nombre: encontrado?.nombre ?? "",
      apellido_p: encontrado?.apellido_p ?? "",
      apellido_m: encontrado?.apellido_m ?? "",
      telefono: (encontrado?.telefono ?? "").toString(),
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!encontradoId) return;
    try {
      await updateEncontrado({
        variables: {
          where: { id: encontradoId },
          data: {
            nombre: form.nombre.trim() || undefined,
            apellido_p: form.apellido_p.trim() || undefined,
            apellido_m: form.apellido_m.trim() || undefined,
            telefono: form.telefono.trim() || undefined,
          },
        },
      });
      toast.success("Datos actualizados correctamente");
      setIsEditing(false);
    } catch {}
  };

  const title = isAplicar ? "Confirmar bautizo" : "Quitar bautizo";
  const description = isAplicar
    ? "Confirma que deseas aplicar bautizo para el siguiente encontrado:"
    : "Confirma que deseas quitar el bautizo del siguiente encontrado:";
  const confirmLabel = loading ? "Guardando…" : "Confirmar";

  return (
    <GlassModal
      open={open}
      onClose={onCancel}
      ariaLabelledBy="confirmar-bautizo-modal-title"
      panelClassName="max-h-[min(90vh,calc(100dvh-2rem))] max-w-lg overflow-y-auto overscroll-contain p-6"
      disableBackdropClose={loadingAny}
      zIndex={zIndex}
    >
        <h2
          id="confirmar-bautizo-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          {isEditing ? "Editar encontrado" : title}
        </h2>

        {isEditing ? (
          <>
            <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
              Modifica nombre, apellidos y teléfono del encontrado.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      nombre: e.target.value.toUpperCase(),
                    }))
                  }
                  className={inputClass}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Apellido paterno
                </label>
                <input
                  type="text"
                  value={form.apellido_p}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      apellido_p: e.target.value.toUpperCase(),
                    }))
                  }
                  className={inputClass}
                  placeholder="Apellido paterno"
                />
              </div>
              <div>
                <label className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Apellido materno
                </label>
                <input
                  type="text"
                  value={form.apellido_m}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      apellido_m: e.target.value.toUpperCase(),
                    }))
                  }
                  className={inputClass}
                  placeholder="Apellido materno"
                />
              </div>
              <div>
                <label className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.telefono}
                  maxLength={10}
                  pattern="[0-9]*"
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, telefono: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Teléfono"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={savingEdit}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="rounded-xl bg-app-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-primary/90 disabled:opacity-50 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
              >
                {savingEdit ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
              {description}
            </p>
            <div className="relative mt-4">
              <button
                type="button"
                onClick={startEditing}
                className="absolute right-2 top-2 z-10 rounded-lg p-1.5 text-app-text-secondary transition-colors hover:bg-gray-100 hover:text-app-text-primary dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                aria-label="Editar nombre y teléfono"
              >
                <HugeiconsIcon icon={UserEdit01Icon} size={20} />
              </button>
              <dl className="space-y-2 rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-12 dark:border-gray-700 dark:bg-[#151515]">
                <div>
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                    Nombre
                  </dt>
                  <dd className="mt-0.5 font-medium text-app-text-primary dark:text-white">
                    {nombreCompleto || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                    Teléfono
                  </dt>
                  <dd className="mt-0.5 font-medium text-app-text-primary dark:text-white">
                    {telefonoDisplay || "—"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-app-selected disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50
                  ${
                    encontrado?.sexo === "H"
                      ? "bg-app-primary hover:bg-app-primary/90 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
                      : "bg-pink-500 hover:bg-pink-500/90 dark:bg-pink-500 dark:hover:bg-pink-500/90"
                  }
                `}
              >
                {confirmLabel}
              </button>
            </div>
          </>
        )}
    </GlassModal>
  );
}
