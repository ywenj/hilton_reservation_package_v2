import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { UserRole } from "../types/auth";

interface Props {
  children: React.ReactElement;
  roles?: UserRole[]; // optional allowed roles
}

export const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};
