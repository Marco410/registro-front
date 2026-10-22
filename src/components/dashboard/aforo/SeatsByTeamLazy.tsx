"use client";

import dynamic from "next/dynamic";

const SeatsByTeam = dynamic(
  () =>
    import("./SeatsByTeam").then((mod) => mod.SeatsByTeam),
  {
    ssr: false,
    loading: () => (
      <div className="h-[32rem] animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
    ),
  },
);

export function SeatsByTeamLazy() {
  return <SeatsByTeam />;
}
