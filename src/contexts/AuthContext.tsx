import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, School, AuthContextType } from '../types/auth';
import { apiService } from '../services/api';
import { isApiConnected } from '../utils/env';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Моковые данные школ
const MOCK_SCHOOLS: School[] = [
  { 
    id: '1', 
    name: 'Онлайн-школа "Прогресс"', 
    createdAt: new Date('2024-01-15'),
    adminName: 'Владелец Прогресса',
    adminEmail: 'admin@progress.com'
  },
  { 
    id: '2', 
    name: 'Академия цифровых навыков', 
    createdAt: new Date('2024-03-20'),
    adminName: 'Иван Петров',
    adminEmail: 'admin@academy.com'
  },
  { 
    id: '3', 
    name: 'Школа программирования "Код"', 
    createdAt: new Date('2024-06-10'),
    adminName: 'Мария Сидорова',
    adminEmail: 'admin@code.com'
  },
];

// Моковые пользователи для демонстрации
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'sochneva.anastasiya@gmail.com',
    password: 'qwertyasd',
    name: 'Анастасия Сочнева',
    role: 'architect',
    schoolId: null,
  },
  {
    id: '2',
    email: 'admin@progress.com',
    password: 'admin123',
    name: 'Владелец Прогресса',
    role: 'admin',
    schoolId: '1',
  },
  {
    id: '3',
    email: 'galina@progress.com',
    password: 'manager123',
    name: 'Галина',
    role: 'manager',
    schoolId: '1',
  },
  {
    id: '4',
    email: 'andrey@progress.com',
    password: 'manager123',
    name: 'Андрей',
    role: 'manager',
    schoolId: '1',
  },
  {
    id: '5',
    email: 'assistant@progress.com',
    password: 'assistant123',
    name: 'Помощник Админа',
    role: 'assistant',
    schoolId: '1',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Восстанавливаем из localStorage при загрузке
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [school, setSchool] = useState<School | null>(() => {
    const savedSchool = localStorage.getItem('school');
    return savedSchool ? JSON.parse(savedSchool) : null;
  });

  const login = async (email: string, password: string) => {
    if (!isApiConnected()) {
      // MOCK API - для разработки
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Неверный email или пароль');
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));

      if (foundUser.schoolId) {
        const userSchool = MOCK_SCHOOLS.find(s => s.id === foundUser.schoolId);
        if (userSchool) {
          setSchool(userSchool);
          localStorage.setItem('school', JSON.stringify(userSchool));
        }
      }
    } else {
      // REAL API - для продакшена
      const response = await apiService.login(email, password);
      
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      if (response.school) {
        setSchool(response.school);
        localStorage.setItem('school', JSON.stringify(response.school));
      }
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string,
    schoolName?: string
  ) => {
    if (!isApiConnected()) {
      // MOCK API - для разработки
      const existingUser = MOCK_USERS.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      let newSchoolId: string | null = null;
      if (schoolName) {
        const newSchool: School = {
          id: Date.now().toString(),
          name: schoolName,
          createdAt: new Date(),
        };
        MOCK_SCHOOLS.push(newSchool);
        newSchoolId = newSchool.id;
        setSchool(newSchool);
        localStorage.setItem('school', JSON.stringify(newSchool));
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'admin',
        schoolId: newSchoolId,
      };

      MOCK_USERS.push({ ...newUser, password });
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      // REAL API - для продакшена
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
    }
  };

  const logout = () => {
    if (isApiConnected()) {
      apiService.logout().catch(console.error);
    }
    
    setUser(null);
    setSchool(null);
    localStorage.removeItem('user');
    localStorage.removeItem('school');
    localStorage.removeItem('token');
  };

  const selectSchool = async (schoolId: string) => {
    if (!isApiConnected()) {
      // MOCK API
      const selectedSchool = MOCK_SCHOOLS.find(s => s.id === schoolId);
      if (selectedSchool) {
        setSchool(selectedSchool);
        localStorage.setItem('school', JSON.stringify(selectedSchool));
      }
    } else {
      // REAL API
      const schoolData = await apiService.getSchool(schoolId);
      setSchool(schoolData);
      localStorage.setItem('school', JSON.stringify(schoolData));
    }
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

// Экспортируем моковые данные для использования в других компонентах
export { MOCK_SCHOOLS };