import { gql } from "@apollo/client";

export const QUERY_RESERVATIONS = gql`
  query Reservations($date: String, $status: String) {
    reservations(date: $date, status: $status) {
      _id
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
      guestName
      status
      expectedArrival
      tableSize
    }
  }
`;

export const MUTATION_SET_STATUS = gql`
  mutation SetReservationStatus($id: String!, $status: String!) {
    setReservationStatus(id: $id, status: $status) {
      _id
      status
    }
  }
`;
