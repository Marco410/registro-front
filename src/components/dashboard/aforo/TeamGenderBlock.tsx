import { Seat } from "registro/graphql/aforo/queries";
const TEAM_LABEL_WIDTH = "min-w-[5.5rem] w-[5.5rem]";

export function TeamGenderBlock({
  teamKey,
  team,
  seats,
  sex,
}: {
  teamKey: string;
  team: Seat["team"];
  seats: Seat[];
  sex: "H" | "M";
}) {
  const teamLabel = team
    ? `Eq. ${team.teamNumber}${team.ageGroup?.label ? ` (${team.ageGroup.label})` : ""}`
    : "Sin equipo";

  return (
    <div key={`${teamKey}-${sex}`} className="flex w-full items-center gap-3">
      <p
        className={`shrink-0 truncate text-right text-[10px] font-medium leading-tight text-app-text-secondary dark:text-gray-400 ${TEAM_LABEL_WIDTH}`}
        title={teamLabel}
      >
        {teamLabel}
      </p>
      <div className="min-w-0 flex-1 flex flex-wrap gap-1">
        {seats.length === 0 ? (
          <span className="text-[10px] text-app-text-secondary dark:text-gray-400">
            Sin asientos
          </span>
        ) : (
          seats.map((seat) => <SeatBox key={seat.id} seat={seat} sex={sex} />)
        )}
      </div>
    </div>
  );
}

const SEAT_SIZE = "h-8 w-8";
const SEAT_TEXT = "text-xs";

function SeatBox({ seat, sex }: { seat: Seat; sex: "H" | "M" }) {
  const occupied = seat.occupied;
  const isMale = sex === "H";
  const filledClass = occupied
    ? isMale
      ? "bg-app-primary/90 text-white border-app-primary dark:bg-app-primary-muted dark:border-app-primary-muted"
      : "bg-pink-500/90 text-white border-pink-500 dark:bg-pink-500 dark:border-pink-500"
    : "bg-transparent border-gray-300 text-app-text-secondary dark:border-gray-600 dark:text-gray-400";

  const tooltipText =
    occupied && seat.encontrado
      ? `${seat.encontrado.nombre} ${seat.encontrado.apellido_p} ${seat.encontrado.apellido_m} | ${seat.gender}${seat.team?.teamNumber}${seat.letter}`
      : null;

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className={`flex shrink-0 cursor-pointer items-center justify-center rounded border ${SEAT_SIZE} ${SEAT_TEXT} font-medium transition-colors hover:ring-2 hover:ring-offset-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500 ${filledClass}`}
        aria-label={tooltipText ?? seat.letter ?? seat.id}
      >
        {seat.letter || seat.id.slice(0, 2)}
      </button>
      {tooltipText && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-md opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700"
        >
          {tooltipText}
          <span
            className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"
            aria-hidden
          />
        </span>
      )}
    </div>
  );
}
