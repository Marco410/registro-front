"use client";

import { useState, useEffect } from "react";
import {
  CardBeforeCheckin,
  CheckinActions,
  CheckinEncontradoSelector,
  CheckinResultCard,
  usePerformCheckin,
  useUpdateCheckinOptions,
  MyCheckinsList,
} from "registro/components/dashboard/checkin";
import type { EncontradoListItem } from "registro/graphql/encontrados/queries";
import type { PerformCheckinResponse } from "registro/graphql/checkin/mutations";
import type { CheckinListItem } from "registro/graphql/checkin/queries";
import { useAuth } from "registro/hooks/use-auth";
import {
  getStoredSexo,
  PENDING_CHECKIN_RESULT_KEY,
  REGISTRO_SEXO_KEY,
} from "registro/constants/const";

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
  const [sexoFilter, setSexoFilter] = useState<"H" | "M" | null>(() =>
    getStoredSexo(),
  );
  const [celular, setCelular] = useState(true);
  const [medicamento, setMedicamento] = useState(false);
  const [checkinResult, setCheckinResult] = useState<
    PerformCheckinResponse["performCheckin"] | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    try {
      const stored = window.sessionStorage.getItem(PENDING_CHECKIN_RESULT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(
        stored,
      ) as PerformCheckinResponse["performCheckin"];
      if (parsed?.checkin) setCheckinResult(parsed);
      window.sessionStorage.removeItem(PENDING_CHECKIN_RESULT_KEY);
    } catch {
      window.sessionStorage.removeItem(PENDING_CHECKIN_RESULT_KEY);
    }
  }, []);

  const handleSelectEncontrado = (item: EncontradoListItem | null) => {
    setSelected(item);
    if (item != null) {
      setCelular(item.celular ?? true);
      setMedicamento(item.medicamento ?? false);
    }
  };

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
          celular: c.encontrado.celular,
          medicamento: c.encontrado.medicamento,
          nombre: c.encontrado.nombre,
          apellido_p: c.encontrado.apellido_p,
          apellido_m: c.encontrado.apellido_m ?? "",
          sexo: c.encontrado.sexo,
          edad: c.encontrado.edad,
          estado_c: c.encontrado.estado_c,
          religion: c.encontrado.religion,
          telefono: c.encontrado.telefono,
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
        apellido_p: checkin.encontrado.apellido_p ?? "",
        apellido_m: checkin.encontrado.apellido_m ?? null,
        sexo: (checkin.encontrado.sexo === "M" ? "M" : "H") as "H" | "M",
        teamName: checkin.team?.teamName,
        seatLetter: checkin.seat?.letter,
        celular: checkin.encontrado.celular,
        medicamento: checkin.encontrado.medicamento,
        edad: checkin.encontrado.edad ?? undefined,
        estado_c: checkin.encontrado.estado_c ?? undefined,
        religion: checkin.encontrado.religion ?? undefined,
        telefono: checkin.encontrado.telefono ?? undefined,
      }
    : null;

  return (
    <div className="w-full max-w-7xl">
      <div className={`border-l-4 pl-4 border-green-500`}>
        <h1 className="text-2xl font-semibold tracking-tight bg-green dark:text-white sm:text-3xl">
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
            <div className="space-y-6">
              <CheckinResultCard data={resultData} />
              <CheckinActions
                resultData={resultData}
                onNewCheckin={handleNewCheckin}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {selected && (
                <CardBeforeCheckin
                  selected={selected}
                  sexo={sexo}
                  celular={celular}
                  medicamento={medicamento}
                  onCelularChange={setCelular}
                  onMedicamentoChange={setMedicamento}
                  onSaveOptions={handleSaveOptions}
                  onDoCheckin={handleDoCheckin}
                  savingOptions={savingOptions}
                  performingCheckin={performingCheckin}
                  onCancel={() => setSelected(null)}
                  onSelectedUpdate={(item) => {
                    setSelected(item);
                    setCelular(item.celular ?? true);
                    setMedicamento(item.medicamento ?? false);
                  }}
                />
              )}

              <CheckinEncontradoSelector
                userId={userId}
                selectedId={selected?.id ?? null}
                onSelect={handleSelectEncontrado}
                sexo={sexo}
                sexoFilter={sexoFilter}
                onSexoFilterChange={(value) => {
                  window.localStorage.setItem(REGISTRO_SEXO_KEY, value);
                  setSexoFilter(value);
                }}
              />
            </div>
          )}
        </div>
        <aside className="lg:border-l lg:border-gray-200 lg:pl-8 dark:lg:border-gray-700">
          <MyCheckinsList
            userId={userId}
            onSelect={handleSelectCheckinFromList}
            checkinSelected={checkinResult ?? null}
          />
        </aside>
      </div>
    </div>
  );
}
