"use client";

import { useEffect, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  CREATE_SEAT_MUTATION,
} from "registro/graphql/aforo/mutations";
import {
  SEATS_QUERY,
  TEAMS_QUERY,
  type TeamsQueryResponse,
} from "registro/graphql/aforo/queries";
import { GlassModal } from "registro/components/shared/GlassModal";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted";

const addSeatSchema = z.object({
  teamId: z.string().min(1, "Selecciona un equipo"),
  letter: z.string().trim().min(1, "La letra es obligatoria"),
  gender: z.enum(["H", "M"], {
    errorMap: () => ({ message: "Selecciona el género del asiento" }),
  }),
});

type FormState = z.infer<typeof addSeatSchema>;

const defaultForm: FormState = {
  teamId: "",
  letter: "",
  gender: "H",
};

function formatTeamLabel(team: TeamsQueryResponse["teams"][number]) {
  const ageGroup = team.ageGroup?.label ?? "";
  return `${team.teamNumber} · ${team.teamName}${ageGroup ? ` (${ageGroup})` : ""}`;
}

/** Separa letras por coma: "M, N, O" → ["M", "N", "O"] */
function parseSeatLetters(input: string): string[] {
  return input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export interface AddSeatModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddSeatModal({ open, onClose }: AddSeatModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const client = useApolloClient();

  const { data: teamsData, loading: loadingTeams } = useQuery<TeamsQueryResponse>(
    TEAMS_QUERY,
    {
      skip: !open,
      fetchPolicy: "cache-first",
    },
  );

  useEffect(() => {
    if (!open) return;
    setForm(defaultForm);
  }, [open]);

  const teams = teamsData?.teams ?? [];
  const busy = saving || loadingTeams;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = addSeatSchema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        first.teamId?.[0] ??
        first.letter?.[0] ??
        first.gender?.[0] ??
        "Revisa los datos del formulario";
      toast.error(msg);
      return;
    }

    const { teamId, letter, gender } = parsed.data;
    const letters = parseSeatLetters(letter);

    if (letters.length === 0) {
      toast.error("Ingresa al menos una letra");
      return;
    }

    setSaving(true);
    try {
      for (const seatLetter of letters) {
        await client.mutate({
          mutation: CREATE_SEAT_MUTATION,
          variables: {
            data: {
              letter: seatLetter,
              gender,
              team: { connect: { id: teamId } },
            },
          },
        });
      }

      await client.refetchQueries({ include: [SEATS_QUERY] });
      toast.success(
        letters.length === 1
          ? "Asiento creado"
          : `${letters.length} asientos creados`,
      );
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear los asientos";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      ariaLabelledBy="add-seat-modal-title"
      panelClassName="max-w-md overflow-hidden"
      disableBackdropClose={busy}
    >
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2
          id="add-seat-modal-title"
          className="text-lg font-semibold text-app-text-primary dark:text-white"
        >
          Agregar asiento
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <label
            htmlFor="add-seat-team"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400"
          >
            Equipo
          </label>
          <select
            id="add-seat-team"
            value={form.teamId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, teamId: e.target.value }))
            }
            className={inputClass}
            disabled={busy || teams.length === 0}
          >
            <option value="">
              {loadingTeams ? "Cargando equipos…" : "Selecciona un equipo"}
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {formatTeamLabel(team)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="add-seat-letter"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400"
          >
            Letra(s)
          </label>
          <input
            id="add-seat-letter"
            type="text"
            value={form.letter}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, letter: e.target.value }))
            }
            className={inputClass}
            disabled={busy}
            autoComplete="off"
            placeholder="M o M, N, O"
          />
          <p className="mt-1 text-xs text-app-text-secondary dark:text-gray-500">
            Separa varias letras con coma para crear varios asientos.
          </p>
        </div>
        <div>
          <label
            htmlFor="add-seat-gender"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400"
          >
            Género
          </label>
          <select
            id="add-seat-gender"
            value={form.gender}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                gender: e.target.value as FormState["gender"],
              }))
            }
            className={inputClass}
            disabled={busy}
          >
            <option value="H">Hombre</option>
            <option value="M">Mujer</option>
          </select>
        </div>
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="submit"
            disabled={busy || teams.length === 0}
            className="w-full rounded-xl bg-app-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-app-primary-muted dark:hover:bg-app-primary-muted/90"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
