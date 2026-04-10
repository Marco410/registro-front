import { gql } from "@apollo/client";
import type { EventTypeValue } from "registro/graphql/events/queries";

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($data: EventCreateInput!) {
    createEvent(data: $data) {
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

export const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateEvent($where: EventWhereUniqueInput!, $data: EventUpdateInput!) {
    updateEvent(where: $where, data: $data) {
      id
    }
  }
`;

export const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($where: EventWhereUniqueInput!) {
    deleteEvent(where: $where) {
      id
    }
  }
`;

export interface EventCreateVariables {
  data: {
    name: string;
    description?: string | null;
    active?: boolean;
    type?: EventTypeValue;
  };
}

export interface EventUpdateVariables {
  where: { id: string };
  data: {
    name?: string;
    description?: string | null;
    active?: boolean;
    type?: EventTypeValue;
  };
}

export interface EventDeleteVariables {
  where: { id: string };
}
