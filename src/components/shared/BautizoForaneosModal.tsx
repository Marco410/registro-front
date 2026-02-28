"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import {
  BAUTIZO_FORANEOS_QUERY,
  BAUTIZO_COUNTS_QUERY,
  type BautizoForaneo,
  type BautizoForaneosResponse,
} from "registro/graphql/aforo/queries";
import {
  CREATE_BAUTIZO_FORANEO_MUTATION,
  DELETE_BAUTIZO_FORANEO_MUTATION,
} from "registro/graphql/aforo/mutations";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted";

function getNombreCompleto(f: BautizoForaneo): string {
  return [f.nombre, f.apellido_p, f.apellido_m]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export interface BautizoForaneosModalProps {
  open: boolean;
  onClose: () => void;
}

export function BautizoForaneosModal({
  open,
  onClose,
}: BautizoForaneosModalProps) {
  const [form, setForm] = useState({
    nombre: "",
    apellido_p: "",
    apellido_m: "",
    gender: "H",
    telefono: "",
    notes: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<BautizoForaneo | null>(null);

  const { data, loading: loadingList } = useQuery<BautizoForaneosResponse>(
    BAUTIZO_FORANEOS_QUERY,
    { skip: !open },
  );

  const [createForaneo, { loading: creating }] = useMutation(
    CREATE_BAUTIZO_FORANEO_MUTATION,
    {
      refetchQueries: [
        { query: BAUTIZO_FORANEOS_QUERY },
        { query: BAUTIZO_COUNTS_QUERY },
      ],
      onCompleted: () => {
        toast.success("Foráneo bautizado registrado");
        setForm({
          nombre: "",
          apellido_p: "",
          apellido_m: "",
          gender: "H",
          telefono: "",
          notes: "",
        });
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al registrar");
      },
    },
  );

  const [deleteForaneo, { loading: deleting }] = useMutation(
    DELETE_BAUTIZO_FORANEO_MUTATION,
    {
      refetchQueries: [
        { query: BAUTIZO_FORANEOS_QUERY },
        { query: BAUTIZO_COUNTS_QUERY },
      ],
      onCompleted: () => {
        toast.success("Registro eliminado");
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err.message ?? "Error al eliminar");
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nombre = form.nombre.trim();
    if (!nombre) {
      toast.error("El nombre es obligatorio");
      return;
    }
    createForaneo({
      variables: {
        data: {
          nombre,
          apellido_p: form.apellido_p.trim() || undefined,
          apellido_m: form.apellido_m.trim() || undefined,
          gender: form.gender,
          telefono: form.telefono.trim() || undefined,
          notes: form.notes.trim() || undefined,
        },
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteForaneo({
      variables: { where: { id: deleteTarget.id } },
    });
  };

  if (!open) return null;

  const list = data?.bautizoForaneos ?? [];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bautizo-foraneos-modal-title"
        onClick={() => !creating && onClose()}
      >
        <div
          className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-gray-200 bg-app-sidebar shadow-xl dark:border-gray-700 dark:bg-[#202124]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h2
              id="bautizo-foraneos-modal-title"
              className="text-lg font-semibold text-app-text-primary dark:text-white"
            >
              Foráneos bautizados
            </h2>
            <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
              Registrar nuevo y ver lista. Las notas se muestran al pasar el
              cursor sobre la fila.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-b border-gray-200 p-4 dark:border-gray-700"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      nombre: e.target.value.toUpperCase(),
                    }))
                  }
                  className={inputClass}
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Apellido paterno
                </label>
                <input
                  type="text"
                  value={form.apellido_p}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      apellido_p: e.target.value.toUpperCase(),
                    }))
                  }
                  className={inputClass}
                  placeholder="Apellido paterno"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Apellido materno
                </label>
                <input
                  type="text"
                  value={form.apellido_m}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      apellido_m: e.target.value.toUpperCase(),
                    }))
                  }
                  className={inputClass}
                  placeholder="Apellido materno"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Género
                </label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, gender: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="H">Hombre</option>
                  <option value="M">Mujer</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Teléfono
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, telefono: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Teléfono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400">
                  Notas
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Notas"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-app-primary px-4 py-2 text-sm font-medium text-white hover:bg-app-primary/90 disabled:opacity-50 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
              >
                {creating ? "Guardando…" : "Registrar foráneo bautizado"}
              </button>
            </div>
          </form>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {loadingList ? (
              <p className="text-sm text-app-text-secondary dark:text-gray-400">
                Cargando lista…
              </p>
            ) : list.length === 0 ? (
              <p className="text-sm text-app-text-secondary dark:text-gray-400">
                No hay foráneos bautizados registrados.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                      <th className="px-3 py-2 font-medium text-app-text-secondary dark:text-gray-400">
                        Nombre
                      </th>
                      <th className="px-3 py-2 font-medium text-app-text-secondary dark:text-gray-400">
                        Género
                      </th>
                      <th className="px-3 py-2 font-medium text-app-text-secondary dark:text-gray-400">
                        Teléfono
                      </th>
                      <th className="w-10 px-2 py-2" aria-label="Eliminar" />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr
                        key={row.id}
                        className="group border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                      >
                        <td className="relative px-3 py-2 font-medium text-app-text-primary dark:text-white">
                          {getNombreCompleto(row)}
                          {row.notes && (
                            <span
                              role="tooltip"
                              className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 max-w-[280px] rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg opacity-0 transition-opacity duration-100 group-hover:opacity-100 dark:bg-gray-700"
                            >
                              {row.notes}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-app-text-secondary dark:text-gray-400">
                          {row.gender === "H" ? "H" : "M"}
                        </td>
                        <td className="px-3 py-2 text-app-text-secondary dark:text-gray-400">
                          {row.telefono || "—"}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            aria-label={`Eliminar a ${getNombreCompleto(row)}`}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminar */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-app-text-primary/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-foraneo-title"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-app-sidebar p-6 shadow-xl dark:border-gray-700 dark:bg-[#202124]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="confirm-delete-foraneo-title"
              className="text-lg font-semibold text-app-text-primary dark:text-white"
            >
              ¿Eliminar registro?
            </h2>
            <p className="mt-2 text-sm text-app-text-secondary dark:text-gray-400">
              Se eliminará a <strong>{getNombreCompleto(deleteTarget)}</strong>{" "}
              de la lista de foráneos bautizados. Esta acción no se puede
              deshacer.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
