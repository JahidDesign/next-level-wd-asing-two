
export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}
