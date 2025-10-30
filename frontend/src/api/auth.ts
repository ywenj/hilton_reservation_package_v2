// Auth API client wrappers
// Assumes environment variables: VITE_AUTH_BASE_URL
// Endpoints: POST /auth/login { email, password } => { token, user }
//            POST /auth/register { name, email, password } => { token, user }
//            POST /auth/introspect { token } => { active, sub, role, exp }

// Backend /auth/login returns { access_token }
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

export async function loginAuth(
  username: string,
  password: string
): Promise<LoginResponse> {
  return postJson<LoginResponse>("/auth/login", { username, password });
}

export async function registerEmployee(
  username: string,
  password: string
): Promise<{ id: string; username: string; role: string }> {
  return postJson<{ id: string; username: string; role: string }>(
    "/auth/register",
    {
      username,
      password,
      role: "employee",
    }
  );
}

export async function introspectToken(token: string) {
  return postJson("/auth/introspect", { token });
}
