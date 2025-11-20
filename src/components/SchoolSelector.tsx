import React, { useMemo, useState, useEffect } from 'react';
import { useAuth, MOCK_SCHOOLS } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Building2, ChevronRight, Settings } from 'lucide-react';
import { SchoolManagement } from './SchoolManagement';
import { apiService } from '../services/api';
import { useMockApi } from '../utils/env';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
  createdAt: Date;
  adminName?: string;
  adminEmail?: string;
}

export function SchoolSelector() {
  const { selectSchool } = useAuth();
  const [activeTab, setActiveTab] = useState<'select' | 'manage'>('select');
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const USE_MOCK_API = useMockApi();

  // Generate symbols once
  const backgroundSymbols = useMemo(() => {
    const symbols = ['%', '+', '-', '=', '₽', '×'];
    const colors = [
      'text-purple-400/40',
      'text-blue-400/40',
      'text-indigo-400/40',
      'text-violet-400/40',
      'text-cyan-400/30',
    ];
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 3,
      fontSize: 12 + Math.random() * 16,
      fontWeight: Math.random() > 0.5 ? 600 : 400,
    }));
  }, []);

  // Загрузка школ
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      if (USE_MOCK_API) {
        // Используем моковые данные
        setSchools(MOCK_SCHOOLS);
      } else {
        // Загружаем из API
        const response = await apiService.getSchools();
        setSchools(response.schools || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки школ:', error);
      toast.error('Не удалось загрузить список школ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async (schoolData: {
    schoolName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }) => {
    try {
      if (USE_MOCK_API) {
        // Моковое добавление
        const newSchool: School = {
          id: Date.now().toString(),
          name: schoolData.schoolName,
          createdAt: new Date(),
          adminName: schoolData.adminName,
          adminEmail: schoolData.adminEmail,
        };
        setSchools([...schools, newSchool]);
        toast.success(`Школа "${schoolData.schoolName}" успешно создана`, {
          description: `Администратор: ${schoolData.adminName}`
        });
      } else {
        // Реальное API
        const response = await apiService.createSchool(schoolData);
        await loadSchools(); // Перезагружаем список
        toast.success(`Школа "${schoolData.schoolName}" успешно создана`, {
          description: `Администратор: ${schoolData.adminName}`
        });
      }
      // Переключаемся на вкладку выбора школы после создания
      setActiveTab('select');
    } catch (error: any) {
      console.error('Ошибка создания школы:', error);
      toast.error('Не удалось создать школу', {
        description: error.message || 'Попробуйте ещё раз'
      });
    }
  };

  const handleEditSchool = async (schoolId: string, data: {
    schoolName?: string;
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
  }) => {
    try {
      if (USE_MOCK_API) {
        // Моковое редактирование
        setSchools(schools.map(school => {
          if (school.id === schoolId) {
            return {
              ...school,
              name: data.schoolName || school.name,
              adminName: data.adminName || school.adminName,
              adminEmail: data.adminEmail || school.adminEmail,
            };
          }
          return school;
        }));
        toast.success('Данные владельца школы успешно обновлены');
      } else {
        // Реальное API
        await apiService.updateSchool(schoolId, data);
        await loadSchools(); // Перезагружаем список
        toast.success('Данные владельца школы успешно обновлены');
      }
    } catch (error: any) {
      console.error('Ошибка обновления школы:', error);
      toast.error('Не удалось обновить данные', {
        description: error.message || 'Попробуйте ещё раз'
      });
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    try {
      if (USE_MOCK_API) {
        // Моковое удаление
        const schoolToDelete = schools.find(s => s.id === schoolId);
        setSchools(schools.filter(school => school.id !== schoolId));
        toast.success(`Школа "${schoolToDelete?.name}" успешно удалена`);
      } else {
        // Реальное API
        const schoolToDelete = schools.find(s => s.id === schoolId);
        await apiService.deleteSchool(schoolId);
        await loadSchools(); // Перезагружаем список
        toast.success(`Школа "${schoolToDelete?.name}" успешно удалена`);
      }
    } catch (error: any) {
      console.error('Ошибка удаления школы:', error);
      toast.error('Не удалось удалить школу', {
        description: error.message || 'Попробуйте ещё раз'
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 bg-[#F7F8FA]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-purple-100/50 via-blue-50/30 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-radial from-blue-100/40 via-purple-50/30 to-transparent blur-3xl" />
        </div>
        
        {/* Stars */}
        <div className="absolute inset-0">
          {backgroundSymbols.map((item) => (
            <div
              key={item.id}
              className={`absolute animate-twinkle ${item.color} select-none pointer-events-none`}
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
                fontSize: `${item.fontSize}px`,
                fontWeight: item.fontWeight,
              }}
            >
              {item.symbol}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-300/40 animate-gradient">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">
              {activeTab === 'select' ? 'Выберите школу' : 'Управление школами'}
            </h1>
            <p className="text-gray-600">Режим Архитектора - доступ ко всем школам</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('select')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'select'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Выбор школы
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'manage'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Управление
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Загрузка...</p>
            </div>
          ) : activeTab === 'select' ? (
            <>
              {/* Schools Grid */}
              <div className="grid gap-4">
                {schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => selectSchool(school.id)}
                    className="group p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-[#7B68EE] transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-gray-900 mb-1">{school.name}</h3>
                          <p className="text-gray-600">
                            Создана: {new Date(school.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#7B68EE] group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-gray-600 text-center">
                  🏛️ Как Архитектор вы можете просматривать и управлять всеми школами
                </p>
              </div>
            </>
          ) : (
            <div className="max-h-[600px] overflow-y-auto pr-2">
              <SchoolManagement schools={schools} onAddSchool={handleAddSchool} onEditSchool={handleEditSchool} onDeleteSchool={handleDeleteSchool} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}