"use client";

import { memo, useState } from "react";
import { Seat } from "registro/graphql/aforo/queries";
import { TeamSeatsModal } from "./TeamSeatsModal";
import { SeatBox } from "./SeatBox";

const TEAM_LABEL_WIDTH = "min-w-[5.5rem] w-[5.5rem]";

function TeamGenderBlockComponent({
  team,
  seats,
  sex,
}: {
  team: Seat["team"];
  seats: Seat[];
  sex: "H" | "M";
}) {
  const [showSeatsModal, setShowSeatsModal] = useState(false);

  const teamLabel = `${team?.teamName ?? ""} (${team?.ageGroup?.label ?? ""})`;

  return (
    <div className="flex w-fit max-w-full items-center gap-3">
      <button
        type="button"
        onClick={team ? () => setShowSeatsModal(true) : undefined}
        className={`shrink-0 truncate text-right text-[10px] font-medium leading-tight text-app-text-secondary underline-offset-2 hover:underline dark:text-gray-400 ${TEAM_LABEL_WIDTH}`}
        title={team ? "Ver asientos y encontrados de este equipo" : teamLabel}
        disabled={!team}
      >
        {teamLabel}
      </button>
      <div className="flex flex-wrap gap-1">
        {seats.length === 0 ? (
          <span className="text-[10px] text-app-text-secondary dark:text-gray-400">
            Sin asientos
          </span>
        ) : (
          seats.map((seat) => <SeatBox key={seat.id} seat={seat} sex={sex} />)
        )}
      </div>
      {showSeatsModal && (
        <TeamSeatsModal
          open={showSeatsModal}
          onClose={() => setShowSeatsModal(false)}
          teamLabel={teamLabel}
          seats={seats}
          sex={sex}
        />
      )}
    </div>
  );
}

export const TeamGenderBlock = memo(TeamGenderBlockComponent);
