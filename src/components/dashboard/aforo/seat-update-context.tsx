"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMutation } from "@apollo/client";
import {
  SEATS_QUERY,
  type Seat,
} from "registro/graphql/aforo/queries";
import {
  UPDATE_SEAT_MUTATION,
  type UpdateSeatVariables,
} from "registro/graphql/aforo/mutations";

type SeatUpdateContextValue = {
  updateSeat: ReturnType<
    typeof useMutation<unknown, UpdateSeatVariables>
  >[0];
};

const SeatUpdateContext = createContext<SeatUpdateContextValue | null>(null);

export function SeatUpdateProvider({ children }: { children: ReactNode }) {
  const [updateSeat] = useMutation<unknown, UpdateSeatVariables>(
    UPDATE_SEAT_MUTATION,
    {
      refetchQueries: [{ query: SEATS_QUERY }],
    },
  );

  return (
    <SeatUpdateContext.Provider value={{ updateSeat }}>
      {children}
    </SeatUpdateContext.Provider>
  );
}

export function useSeatUpdate() {
  const ctx = useContext(SeatUpdateContext);
  if (!ctx) {
    throw new Error("useSeatUpdate must be used within SeatUpdateProvider");
  }
  return ctx;
}

export async function darDeBajaSeat(
  updateSeat: SeatUpdateContextValue["updateSeat"],
  seat: Seat,
) {
  if (!seat.encontrado?.id) return;
  await updateSeat({
    variables: {
      where: { id: seat.id },
      data: {
        abandoned: true,
        occupied: false,
        abandonedBy: { connect: { id: seat.encontrado.id } },
      },
    },
  });
}
