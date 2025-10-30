export type UserRole = "guest" | "employee";
export interface AuthUser {
  id: string;
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
}
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}
