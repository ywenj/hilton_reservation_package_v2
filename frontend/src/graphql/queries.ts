import { gql } from "@apollo/client";

export const QUERY_RESERVATIONS = gql`
  query Reservations($date: String, $status: String) {
    reservations(date: $date, status: $status) {
      _id
      version
      guestName
      contactPhone
      contactEmail
      expectedArrival
      tableSize
      status
    }
  }
`;

export const QUERY_MY_RESERVATIONS = gql`
  query MyReservations {
    myReservations {
      _id
      version
      guestName
      expectedArrival
      tableSize
      status
    }
  }
`;

export const QUERY_RESERVATION = gql`
  query Reservation($id: String!) {
    reservation(id: $id) {
      _id
      version
      guestName
      contactPhone
      contactEmail
      expectedArrival
      tableSize
      status
    }
  }
`;

export const MUTATION_CREATE = gql`
  mutation CreateReservation($input: CreateReservationInput!) {
    createReservation(input: $input) {
      _id
      version
      guestName
      status
      expectedArrival
      tableSize
    }
  }
`;

export const MUTATION_UPDATE = gql`
  mutation UpdateReservation($id: String!, $input: UpdateReservationInput!) {
    updateReservation(id: $id, input: $input) {
      _id
      version
      guestName
      status
      expectedArrival
      tableSize
    }
  }
`;

export const MUTATION_SET_STATUS = gql`
  mutation SetReservationStatus(
    $id: String!
    $status: String!
    $version: Int!
  ) {
    setReservationStatus(id: $id, status: $status, version: $version) {
      _id
      version
      status
    }
  }
`;

export const MUTATION_CANCEL_MY = gql`
  mutation CancelMyReservation($id: String!, $version: Int!) {
    cancelMyReservation(id: $id, version: $version) {
      _id
      version
      status
    }
  }
`;
