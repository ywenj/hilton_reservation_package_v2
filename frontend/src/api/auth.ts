// Auth API client wrappers for role-specific endpoints
// VITE_AUTH_BASE_URL required
// Endpoints:
//  POST /auth/register/employee { username, password }
//  POST /auth/login/employee { username, password }
//  POST /auth/register/guest { username, email?, phone? }
//  POST /auth/login/guest { email?, phone? }
//  POST /auth/introspect { token }

export interface LoginResponse {
  access_token: string;
}

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:5000";

async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function loginEmployee(
  username: string,
  password: string
): Promise<LoginResponse> {
  return postJson<LoginResponse>("/auth/login/employee", {
    username,
    password,
  });
}

export async function loginGuest(
  email?: string,
  phone?: string
): Promise<LoginResponse> {
  return postJson<LoginResponse>("/auth/login/guest", { email, phone });
}

export async function registerGuest(data: {
  username: string;
  email?: string;
  phone?: string;
}) {
  return postJson<{
    id: string;
    role: string;
    email?: string;
    phone?: string;
    username: string;
  }>("/auth/register/guest", data);
}

export async function registerEmployeeNew(username: string, password: string) {
  return postJson<{ id: string; username: string; role: string }>(
    "/auth/register/employee",
    { username, password }
  );
}

export async function introspectToken(token: string) {
  return postJson("/auth/introspect", { token });
}
