import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import { AuthContext } from "../auth/AuthContext";
import { describe, test, expect, vi } from "vitest";
import "@testing-library/jest-dom";

const renderWithUser = (user: any, initialPath: string = "/") => {
  const value = {
    user,
    token: user ? "fake-token" : null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[initialPath]}>
        <AppLayout />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("AppLayout menu rendering", () => {
  test("shows login/register for anonymous", () => {
    const { getByText } = renderWithUser(null, "/login");
    expect(getByText(/Login/i)).toBeInTheDocument();
    expect(getByText(/Register/i)).toBeInTheDocument();
  });

  test("guest after login excludes Register and includes My Reservations", () => {
    const { getByText, queryByText } = renderWithUser(
      { role: "guest", username: "alice", id: "u1" },
      "/my"
    );
    expect(getByText(/My Reservations/i)).toBeInTheDocument();
    expect(queryByText(/Register/i)).toBeNull();
  });

  test("employee sees Admin only", () => {
    const { getByText, queryByText } = renderWithUser(
      { role: "employee", username: "bob", id: "u2" },
      "/admin"
    );
    expect(getByText(/Admin/i)).toBeInTheDocument();
    expect(queryByText(/My Reservations/i)).toBeNull();
    expect(queryByText(/Register/i)).toBeNull();
  });
});
