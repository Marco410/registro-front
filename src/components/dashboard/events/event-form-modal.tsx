"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  CREATE_EVENT_MUTATION,
  UPDATE_EVENT_MUTATION,
} from "registro/graphql/events/mutations";
import {
  ACTIVE_EVENT_QUERY,
  EVENTS_QUERY,
  type EventListItem,
} from "registro/graphql/events/queries";
import { GlassModal } from "registro/components/shared/GlassModal";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted";

const eventFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string(),
  active: z.boolean(),
  type: z.enum(["retiro", "ninos"]),
});

type FormState = z.infer<typeof eventFormSchema>;

const defaultForm: FormState = {
  name: "",
  description: "",
  active: true,
  type: "retiro",
};

function toFormState(ev: EventListItem): FormState {
  return {
    name: ev.name,
    description: ev.description ?? "",
    active: ev.active,
    type: ev.type,
  };
}

export interface EventFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  event: EventListItem | null;
  onClose: () => void;
}

export function EventFormModal({
  open,
  mode,
  event,
  onClose,
}: EventFormModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && event) {
      setForm(toFormState(event));
    } else {
      setForm(defaultForm);
    }
  }, [open, mode, event]);

  const refetch = [{ query: EVENTS_QUERY }, { query: ACTIVE_EVENT_QUERY }];

  const [createEvent, { loading: creating }] = useMutation(
    CREATE_EVENT_MUTATION,
    {
      refetchQueries: refetch,
      onError: (err) => {
        toast.error(err.message ?? "Error al crear el evento");
      },
    },
  );

  const [updateEvent, { loading: updating }] = useMutation(
    UPDATE_EVENT_MUTATION,
    {
      refetchQueries: refetch,
      onError: (err) => {
        toast.error(err.message ?? "Error al actualizar el evento");
      },
    },
  );

  const busy = creating || updating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = eventFormSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        first.name?.[0] ??
        first.type?.[0] ??
        "Revisa los datos del formulario";
      toast.error(msg);
      return;
    }
    const { name, description, active, type } = parsed.data;
    const descTrim = description.trim();
    if (mode === "create") {
      createEvent({
        variables: {
          data: {
            name,
            active,
            type,
            ...(descTrim ? { description: descTrim } : {}),
          },
        },
        onCompleted: () => {
          toast.success("Evento creado");
          onClose();
        },
      });
      return;
    }
    if (!event) return;
    updateEvent({
      variables: {
        where: { id: event.id },
        data: {
          name,
          active,
          type,
          description: descTrim || null,
        },
      },
      onCompleted: () => {
        toast.success("Evento actualizado");
        onClose();
      },
    });
  };

  const title =
    mode === "create" ? "Nuevo evento" : `Editar: ${event?.name ?? ""}`;

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="event-form-modal-title"
      panelClassName="max-w-md overflow-hidden"
      disableBackdropClose={busy}
      zIndex={50}
    >
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2
            id="event-form-modal-title"
            className="text-lg font-semibold text-app-text-primary dark:text-white"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
            Nombre obligatorio. Tipo y estado definen cómo se usa el evento en
            el sistema.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label
              htmlFor="event-name"
              className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400"
            >
              Nombre *
            </label>
            <input
              id="event-name"
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              className={inputClass}
              disabled={busy}
              autoComplete="off"
            />
          </div>
          <div>
            <label
              htmlFor="event-description"
              className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400"
            >
              Descripción
            </label>
            <textarea
              id="event-description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className={`${inputClass} resize-y min-h-[80px]`}
              disabled={busy}
            />
          </div>
          <div>
            <label
              htmlFor="event-type"
              className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400"
            >
              Tipo
            </label>
            <select
              id="event-type"
              value={form.type}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  type: e.target.value as FormState["type"],
                }))
              }
              className={inputClass}
              disabled={busy}
            >
              <option value="retiro">Retiro</option>
              <option value="ninos">Niños</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-app-text-primary dark:text-gray-200">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((p) => ({ ...p, active: e.target.checked }))
              }
              disabled={busy}
              className="h-4 w-4 rounded border-gray-300 text-app-primary focus:ring-app-primary/40 dark:border-gray-600"
            />
            Activo
          </label>
          <div className="flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-app-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-primary/90 disabled:opacity-50 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
            >
              {busy
                ? "Guardando…"
                : mode === "create"
                  ? "Crear evento"
                  : "Guardar cambios"}
            </button>
          </div>
        </form>
    </GlassModal>
  );
}
