import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo/client";
import Home from "./pages/Home";
import ReservationView from "./pages/ReservationView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReservations from "./pages/MyReservations";
import AdminReservations from "./pages/AdminReservations";
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
              <Route path="/" element={<Home />} />
              <Route path="/reservations/:id" element={<ReservationView />} />
              <Route
                path="/my"
                element={
                  <ProtectedRoute roles={["guest", "employee"]}>
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
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}
