import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { LogOut, User, Building2, Shield, Database, ArrowLeft } from 'lucide-react';
import { useMockApi } from '../utils/env';
import { useState, useEffect } from 'react';

const ROLE_LABELS = {
  architect: { label: 'Архитектор', icon: Shield, color: 'from-blue-500 via-purple-500 to-pink-500' },
  admin: { label: 'Администратор', icon: Shield, color: 'from-purple-500 to-pink-500' },
  manager: { label: 'Менеджер', icon: User, color: 'from-blue-500 to-purple-500' },
  assistant: { label: 'Помощник', icon: User, color: 'from-indigo-500 to-blue-500' },
};

export function Header() {
  const { user, school, logout } = useAuth();
  const USE_MOCK_API = useMockApi();
  const [isScrolled, setIsScrolled] = useState(false);

  // Задача #8 - Shrinking header при скролле
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  const roleInfo = ROLE_LABELS[user.role];
  const isArchitect = user.role === 'architect';

  const handleBackToSchools = () => {
    // Очищаем выбранную школу из localStorage
    localStorage.removeItem('school');
    // Перезагружаем страницу, чтобы показать селектор школ
    window.location.reload();
  };

  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-2 shadow-md' : 'py-3 sm:py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: School Info */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {school && (
              <>
                {isArchitect && (
                  <Button
                    onClick={handleBackToSchools}
                    variant="outline"
                    className="rounded-2xl px-2 sm:px-4 h-9 sm:h-10 border-gray-200 hover:bg-purple-50 hover:text-[#7B68EE] hover:border-[#7B68EE] transition-all flex-shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">К списку школ</span>
                  </Button>
                )}
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 min-w-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#7B68EE] flex-shrink-0" />
                  <span className="text-gray-900 text-sm sm:text-base truncate">{school.name}</span>
                </div>
              </>
            )}
            
            {/* API Status Badge */}
            {USE_MOCK_API && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-xl border border-yellow-200 flex-shrink-0">
                <Database className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700 text-xs">Demo Mode</span>
              </div>
            )}
          </div>

          {/* Right: User Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center shadow-md`}>
                <roleInfo.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-gray-900 leading-tight">{user.name}</p>
                <p className="text-gray-600 leading-tight">{roleInfo.label}</p>
              </div>
            </div>

            {/* Mobile User Badge - Compact */}
            <div className="sm:hidden flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-2xl">
              <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${roleInfo.color} flex items-center justify-center shadow-md`}>
                <roleInfo.icon className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={logout}
              variant="outline"
              className="rounded-2xl px-2 sm:px-4 h-9 sm:h-10 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}