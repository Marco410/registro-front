"use client";

import dynamic from "next/dynamic";

const SeatsByTeam = dynamic(
  () =>
    import("./SeatsByTeam").then((mod) => mod.SeatsByTeam),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
          />
        ))}
      </div>
    ),
  },
);

export function SeatsByTeamLazy() {
  return <SeatsByTeam />;
}
