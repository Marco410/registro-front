import { gql } from "@apollo/client";

export const EVENTS_QUERY = gql`
  query EventsList {
    events {
      id
      active
      createdAt
      description
      name
      type
      updatedAt
    }
  }
`;

export type EventTypeValue = "retiro" | "ninos";

export interface EventListItem {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  type: EventTypeValue;
  createdAt: string;
  updatedAt: string;
}

export interface EventsQueryResponse {
  events: EventListItem[];
}

/**
 * Evento activo. El backend garantiza que solo un evento tenga `active: true`.
 */
export const ACTIVE_EVENT_QUERY = gql`
  query ActiveEvent {
    events(where: { active: { equals: true } }, take: 1) {
      id
      name
      type
    }
  }
`;

export interface ActiveEventQueryResponse {
  events: Pick<EventListItem, "id" | "name" | "type">[];
}
