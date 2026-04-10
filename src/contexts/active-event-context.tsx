"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { EventTypeValue } from "registro/graphql/events/queries";

const STORAGE_ID = "registro_active_event_id";
const STORAGE_NAME = "registro_active_event_name";
const STORAGE_TYPE = "registro_active_event_type";

function isEventTypeValue(v: string): v is EventTypeValue {
  return v === "retiro" || v === "ninos";
}

function readStored(): {
  eventId: string | null;
  eventName: string | null;
  eventType: EventTypeValue | null;
} {
  if (typeof window === "undefined") {
    return { eventId: null, eventName: null, eventType: null };
  }
  try {
    const id = localStorage.getItem(STORAGE_ID);
    const name = localStorage.getItem(STORAGE_NAME);
    const typeRaw = localStorage.getItem(STORAGE_TYPE);
    const eventType =
      typeRaw && isEventTypeValue(typeRaw) ? typeRaw : null;
    return {
      eventId: id || null,
      eventName: name || null,
      eventType,
    };
  } catch {
    return { eventId: null, eventName: null, eventType: null };
  }
}

function writeStored(payload: {
  id: string;
  name: string;
  type: EventTypeValue;
}): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_ID, payload.id);
    localStorage.setItem(STORAGE_NAME, payload.name);
    localStorage.setItem(STORAGE_TYPE, payload.type);
  } catch {
    /* ignore quota / private mode */
  }
}

function clearStored(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_ID);
    localStorage.removeItem(STORAGE_NAME);
    localStorage.removeItem(STORAGE_TYPE);
  } catch {
    /* ignore */
  }
}

export interface ActiveEventContextValue {
  eventId: string | null;
  eventName: string | null;
  eventType: EventTypeValue | null;
  setActiveEvent: (payload: {
    id: string;
    name: string;
    type: EventTypeValue;
  }) => void;
  clearActiveEvent: () => void;
  clearIfMatches: (id: string) => void;
}

const ActiveEventContext = createContext<ActiveEventContextValue | null>(null);

export function ActiveEventProvider({ children }: { children: React.ReactNode }) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [eventType, setEventType] = useState<EventTypeValue | null>(null);

  useEffect(() => {
    const s = readStored();
    setEventId(s.eventId);
    setEventName(s.eventName);
    setEventType(s.eventType);
  }, []);

  const setActiveEvent = useCallback(
    (payload: { id: string; name: string; type: EventTypeValue }) => {
      writeStored(payload);
      setEventId(payload.id);
      setEventName(payload.name);
      setEventType(payload.type);
    },
    [],
  );

  const clearActiveEvent = useCallback(() => {
    clearStored();
    setEventId(null);
    setEventName(null);
    setEventType(null);
  }, []);

  const clearIfMatches = useCallback((id: string) => {
    const s = readStored();
    if (s.eventId === id) {
      clearStored();
      setEventId(null);
      setEventName(null);
      setEventType(null);
    }
  }, []);

  const value = useMemo<ActiveEventContextValue>(
    () => ({
      eventId,
      eventName,
      eventType,
      setActiveEvent,
      clearActiveEvent,
      clearIfMatches,
    }),
    [
      eventId,
      eventName,
      eventType,
      setActiveEvent,
      clearActiveEvent,
      clearIfMatches,
    ],
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
