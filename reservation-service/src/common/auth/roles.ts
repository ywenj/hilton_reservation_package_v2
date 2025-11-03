export enum UserRole {
  Guest = "guest",
  Employee = "employee",
}

export interface JwtUser {
  sub: string; // user id
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
  iat?: number;
  exp?: number;
}
