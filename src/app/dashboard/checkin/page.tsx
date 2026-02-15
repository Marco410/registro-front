"use client";

import { useState } from "react";
import {
  CheckinEncontradoSelector,
  CheckinsList,
  CheckinOptionsForm,
  CheckinResultCard,
  usePerformCheckin,
  useUpdateCheckinOptions,
} from "registro/components/dashboard/checkin";
import { SexoSelector } from "registro/components/shared";
import type { EncontradoListItem } from "registro/graphql/encontrados/queries";
import type { PerformCheckinResponse } from "registro/graphql/checkin/mutations";
import type { CheckinListItem } from "registro/graphql/checkin/queries";
import { useAuth } from "registro/hooks/use-auth";

function buildClave(
  sexo: string,
  teamNumber: number | undefined,
  seatLetter: string | undefined,
): string {
  const num = teamNumber != null ? String(teamNumber) : "";
  const letter = seatLetter ?? "";
  return `${sexo}${num}${letter}`.trim();
}

export default function CheckinPage() {
  const { user } = useAuth();
  const userId = user?.id != null ? String(user.id) : "";

  const [selected, setSelected] = useState<EncontradoListItem | null>(null);
  const [sexoFilter, setSexoFilter] = useState<"H" | "M" | null>("H");
  const [celular, setCelular] = useState(true);
  const [medicamento, setMedicamento] = useState(false);
  const [checkinResult, setCheckinResult] = useState<
    PerformCheckinResponse["performCheckin"] | null
  >(null);

  const { updateCheckinOptions, loading: savingOptions } =
    useUpdateCheckinOptions();
  const { performCheckin, loading: performingCheckin } = usePerformCheckin({
    onSuccess: (result) => setCheckinResult(result),
  });

  const sexo = (selected?.sexo === "M" ? "M" : "H") as "H" | "M";
  const isHombre = sexo === "H";
  const pageAccent = isHombre
    ? "border-app-primary"
    : "border-pink-500 dark:border-pink-400";

  const handleSaveOptions = async () => {
    if (!selected) return;
    await updateCheckinOptions({
      encontradoId: selected.id,
      celular,
      medicamento,
    });
  };

  const handleDoCheckin = async () => {
    if (!selected) return;
    await updateCheckinOptions({
      encontradoId: selected.id,
      celular,
      medicamento,
    }).catch(() => {});
    await performCheckin(selected.id, userId);
  };

  const handleNewCheckin = () => {
    setSelected(null);
    setCelular(true);
    setMedicamento(false);
    setCheckinResult(null);
  };

  const handleSelectCheckinFromList = (c: CheckinListItem) => {
    setCheckinResult({
      alreadyCheckedIn: true,
      unassignedGroup: false,
      overflow: false,
      checkin: {
        id: c.id,
        checkinAt: c.checkinAt,
        ageGroup: c.ageGroup ?? { id: "", label: "" },
        encontrado: {
          id: "",
          nombre: [c.encontrado.nombre, c.encontrado.apellido_p, c.encontrado.apellido_m]
            .filter(Boolean)
            .join(" ")
            .trim() || c.encontrado.nombre,
          sexo: c.encontrado.sexo,
        },
        seat: c.seat ?? { id: "", letter: "" },
        team: c.team ?? { id: "", teamNumber: 0, teamName: "" },
      },
    } as PerformCheckinResponse["performCheckin"]);
  };

  if (!userId) {
    return (
      <div className="w-full max-w-3xl">
        <p className="text-sm text-app-text-secondary dark:text-gray-400">
          Inicia sesión para usar el check-in.
        </p>
      </div>
    );
  }

  const checkin = checkinResult?.checkin;
  const resultData = checkin
    ? {
        clave: buildClave(
          checkin.encontrado.sexo,
          checkin.team?.teamNumber,
          checkin.seat?.letter,
        ),
        nombre: checkin.encontrado.nombre,
        sexo: (checkin.encontrado.sexo === "M" ? "M" : "H") as "H" | "M",
        teamName: checkin.team?.teamName,
        seatLetter: checkin.seat?.letter,
      }
    : null;

  return (
    <div className="w-full max-w-6xl">
      <div className={`border-l-4 pl-4 ${pageAccent}`}>
        <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
          Check-in
        </h1>
        <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
          Elige al encontrado, indica si tiene celular o medicamento y realiza
          el check-in.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,minmax(300px,380px)]">
        <div className="min-w-0">
          {resultData ? (
            <div>
              <CheckinResultCard data={resultData} />
              <button
                type="button"
                onClick={handleNewCheckin}
                className="mt-6 text-sm font-medium text-app-text-secondary underline hover:text-app-text-primary dark:text-gray-400 dark:hover:text-gray-200"
              >
                Hacer otro check-in
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <section>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-app-text-primary dark:text-gray-300">
                    Seleccionar registro
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-app-text-secondary dark:text-gray-400">
                      Filtrar por sexo
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <SexoSelector
                        value={sexoFilter ?? "H"}
                        onChange={(e) =>
                          setSexoFilter((e.target.value as "H" | "M") || null)
                        }
                        label=""
                        className="!mb-0"
                      />
                    </div>
                  </div>
                </div>
                <CheckinEncontradoSelector
                  userId={userId}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                  sexo={sexo}
                  sexoFilter={sexoFilter}
                />
              </section>

              {selected && (
                <>
                  <CheckinOptionsForm
                    sexo={sexo}
                    celular={celular}
                    medicamento={medicamento}
                    onCelularChange={setCelular}
                    onMedicamentoChange={setMedicamento}
                    disabled={performingCheckin}
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleSaveOptions}
                      disabled={savingOptions || performingCheckin}
                      className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      {savingOptions ? "Guardando…" : "Guardar opciones"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDoCheckin}
                      disabled={performingCheckin}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow transition-colors disabled:opacity-60 ${isHombre ? "bg-app-primary hover:bg-app-primary/90" : "bg-pink-600 hover:bg-pink-700"}`}
                    >
                      {performingCheckin ? "Procesando…" : "Hacer check-in"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <aside className="lg:border-l lg:border-gray-200 lg:pl-8 dark:lg:border-gray-700">
          <CheckinsList userId={userId} onSelect={handleSelectCheckinFromList} />
        </aside>
      </div>
    </div>
  );
}
