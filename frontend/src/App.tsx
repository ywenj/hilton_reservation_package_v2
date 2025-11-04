import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo/client";
import Home from "./pages/Home"; // guest reservation list
import ReservationView from "./pages/ReservationView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminReservations from "./pages/AdminReservations";
import MyReservations from "./pages/MyReservations";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";
import AppLayout from "./layout/AppLayout";

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth pages (no layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Layout wrapper */}
            <Route element={<AppLayout />}>
              {/* Root route: if not logged in -> Login; if logged in -> Reservations list */}
              <Route path="/" element={<Login />} />
              <Route
                path="/my"
                element={
                  <ProtectedRoute roles={["guest"]}>
                    <MyReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["employee"]}>
                    <AdminReservations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservation/:id"
                element={
                  <ProtectedRoute roles={["guest", "employee"]}>
                    <ReservationView />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}
