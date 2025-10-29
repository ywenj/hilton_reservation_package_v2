import React from "react";
import { ReservationList } from "../components/ReservationList";
import { ReservationForm } from "../components/ReservationForm";

export default function Home() {
  return (
    <div style={{ display: "grid", gap: 32, padding: 20 }}>
      <ReservationForm />
      <ReservationList />
    </div>
  );
}
