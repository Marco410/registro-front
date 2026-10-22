"use client";

import { createContext, useContext, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { useAuth } from "registro/contexts/auth-context";
import {
  ACTIVE_EVENT_QUERY,
  type ActiveEventQueryResponse,
  type EventTypeValue,
} from "registro/graphql/events/queries";

/** Cada cuánto se vuelve a consultar el evento activo, para que las estaciones abiertas se enteren de un cambio. */
const ACTIVE_EVENT_POLL_MS = 60_000;

export interface ActiveEventContextValue {
  eventId: string | null;
  eventName: string | null;
  eventType: EventTypeValue | null;
  /** `true` cuando el evento activo es de tipo niños (formulario y validación específicos). */
  isNinosEvent: boolean;
}

const ActiveEventContext = createContext<ActiveEventContextValue | null>(null);

/**
 * Expone el evento activo (`active: true`) del backend. Para cambiarlo se edita el evento
 * en /dashboard/eventos y se hace refetch de `ACTIVE_EVENT_QUERY`.
 */
export function ActiveEventProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery<ActiveEventQueryResponse>(ACTIVE_EVENT_QUERY, {
    skip: !isAuthenticated,
    pollInterval: ACTIVE_EVENT_POLL_MS,
  });

  const event = data?.events?.[0] ?? null;

  const value = useMemo<ActiveEventContextValue>(
    () => ({
      eventId: event?.id ?? null,
      eventName: event?.name ?? null,
      eventType: event?.type ?? null,
      isNinosEvent: event?.type === "ninos",
    }),
    [event?.id, event?.name, event?.type],
  );

  return (
    <ActiveEventContext.Provider value={value}>
      {children}
    </ActiveEventContext.Provider>
  );
}

export function useActiveEvent(): ActiveEventContextValue {
  const ctx = useContext(ActiveEventContext);
  if (!ctx) {
    throw new Error("useActiveEvent must be used within ActiveEventProvider");
  }
  return ctx;
}

export function useIsNinosEvent(): boolean {
  return useActiveEvent().isNinosEvent;
}
