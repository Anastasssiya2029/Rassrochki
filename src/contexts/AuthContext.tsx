import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { User, School, AuthContextType } from '../types/auth';
import { apiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [school, setSchool] = useState<School | null>(() => {
    const savedSchool = localStorage.getItem('school');
    return savedSchool ? JSON.parse(savedSchool) : null;
  });

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);

    if (response.school) {
      setSchool(response.school);
      localStorage.setItem('school', JSON.stringify(response.school));
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string,
    schoolName?: string
  ) => {
    if (!schoolName) {
      throw new Error('Укажите название школы');
    }

    const response = await apiService.register({
      email,
      password,
      name,
      schoolName,
    });

    setUser(response.user);
    setSchool(response.school);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('school', JSON.stringify(response.school));
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    apiService.logout().catch(console.error);
    
    setUser(null);
    setSchool(null);
    localStorage.removeItem('user');
    localStorage.removeItem('school');
    localStorage.removeItem('token');
  };

  const selectSchool = async (schoolId: string) => {
    const schoolData = await apiService.getSchool(schoolId);
    setSchool(schoolData);
    localStorage.setItem('school', JSON.stringify(schoolData));
  };

  const clearSchool = () => {
    setSchool(null);
    localStorage.removeItem('school');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        school,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        selectSchool,
        clearSchool,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
