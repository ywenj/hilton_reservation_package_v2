import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import { AuthContext } from "../auth/AuthContext";
import { describe, test, expect, vi } from "vitest";
import "@testing-library/jest-dom";

const DummyLogin = () => <div>Login Page</div>;
const DummyRegister = () => <div>Register Page</div>;
const DummyMy = () => <div>My Reservations</div>;
const DummyAdmin = () => <div>Admin</div>;

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
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="login" element={<DummyLogin />} />
            <Route path="register" element={<DummyRegister />} />
            <Route path="my" element={<DummyMy />} />
            <Route path="admin" element={<DummyAdmin />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("AppLayout menu rendering", () => {
  test("anonymous sees login/register menu items on root", () => {
    renderWithUser(null, "/");
    // Query by role to avoid duplicate matches with page content
    expect(
      screen.getByRole("menuitem", { name: /Login/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /Register/i })
    ).toBeInTheDocument();
  });

  test("guest after login excludes Register and includes My Reservations", () => {
    renderWithUser({ role: "guest", username: "alice", id: "u1" }, "/my");
    expect(
      screen.getByRole("menuitem", { name: /My Reservations/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Register/i })).toBeNull();
  });

  test("employee sees Admin only", () => {
    renderWithUser({ role: "employee", username: "bob", id: "u2" }, "/admin");
    expect(
      screen.getByRole("menuitem", { name: /Admin/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /My Reservations/i })
    ).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /Register/i })).toBeNull();
  });
});
