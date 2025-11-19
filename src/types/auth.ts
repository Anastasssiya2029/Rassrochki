export type UserRole = 'architect' | 'admin' | 'manager' | 'assistant';

export interface School {
  id: string;
  name: string;
  createdAt: Date;
  adminName?: string;
  adminEmail?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId: string | null; // null для Архитектора
  managerId?: string; // ID менеджера, за которым закреплены клиенты
}

export interface AuthContextType {
  user: User | null;
  school: School | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, schoolName?: string) => Promise<void>;
  logout: () => void;
  selectSchool: (schoolId: string) => void;
  clearSchool: () => void;
}