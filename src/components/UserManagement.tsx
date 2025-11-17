import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DialogDescription } from './ui/dialog';
import { Plus, User, Mail, Shield, Trash2, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'assistant';
  createdAt: Date;
}

interface UserManagementProps {
  users: User[];
  onAddUser: (userData: { 
    name: string; 
    email: string; 
    password: string;
    role: 'manager' | 'assistant';
  }) => void;
  onEditUser?: (userId: string, userData: {
    name: string;
    email: string;
    password?: string;
    role: 'manager' | 'assistant';
  }) => void;
  onDeleteUser?: (userId: string) => void;
}

export function UserManagement({ users, onAddUser, onEditUser, onDeleteUser }: UserManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'assistant'>('manager');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'manager' | 'assistant'>('manager');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Введите имя пользователя';
    }

    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!password.trim()) {
      newErrors.password = 'Введите пароль';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен быть минимум 6 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editName.trim()) {
      newErrors.name = 'Введите имя пользователя';
    }

    if (!editEmail.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      newErrors.email = 'Некорректный email';
    }

    if (editPassword.trim() && editPassword.length < 6) {
      newErrors.password = 'Пароль должен быть минимум 6 символов';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onAddUser({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
    });

    // Очищаем форму
    setName('');
    setEmail('');
    setPassword('');
    setRole('manager');
    setErrors({});
    setIsDialogOpen(false);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword('');
    setEditRole(user.role);
    setEditErrors({});
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm() || !selectedUser || !onEditUser) {
      return;
    }

    const updateData: {
      name: string;
      email: string;
      password?: string;
      role: 'manager' | 'assistant';
    } = {
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
    };

    if (editPassword.trim()) {
      updateData.password = editPassword.trim();
    }

    onEditUser(selectedUser.id, updateData);

    // Очищаем форму
    setEditName('');
    setEditEmail('');
    setEditPassword('');
    setEditRole('manager');
    setEditErrors({});
    setSelectedUser(null);
    setIsEditDialogOpen(false);
  };

  const getRoleBadge = (userRole: 'manager' | 'assistant') => {
    if (userRole === 'manager') {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
          Менеджер
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">
        Помощник админа
      </Badge>
    );
  };

  const managers = users.filter(u => u.role === 'manager');
  const assistants = users.filter(u => u.role === 'assistant');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#2D1B69] font-semibold mb-2 text-lg sm:text-xl lg:text-2xl">Управление пользователями</h2>
          <p className="text-gray-600 text-sm sm:text-base">Добавление менеджеров и помощников для работы в системе</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-3d-cosmic hover:shadow-3d-hover transition-all duration-400 hover:scale-105 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm sm:text-base">Добавить пользователя</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Добавление пользователя</DialogTitle>
              <DialogDescription className="text-gray-600">
                Создайте нового пользователя и назначьте роль
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="user-role" className="text-gray-900">
                  Роль <span className="text-red-500">*</span>
                </Label>
                <Select value={role} onValueChange={(value) => setRole(value as 'manager' | 'assistant')}>
                  <SelectTrigger id="user-role" className="rounded-2xl border-gray-200 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="assistant">Помощник администратора</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-gray-500 text-sm">
                  {role === 'manager' 
                    ? 'Менеджер работает только со своими клиентами' 
                    : 'Помощник видит всех клиентов, но не может добавлять новых'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-name" className="text-gray-900">
                  Имя <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="user-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Иван Иванов"
                    className="pl-10 rounded-2xl border-gray-200 text-gray-900"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-email" className="text-gray-900">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@school.com"
                    className="pl-10 rounded-2xl border-gray-200 text-gray-900"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-password" className="text-gray-900">
                  Пароль <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="rounded-2xl border-gray-200 text-gray-900"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setErrors({});
                  }}
                  className="flex-1 rounded-2xl border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-3d-cosmic hover:shadow-3d-hover transition-all duration-400"
                >
                  Добавить
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 rounded-3xl shadow-3d bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Менеджеров</p>
              <p className="text-gray-900 text-3xl">{managers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-3xl shadow-3d bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-sm">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Помощников</p>
              <p className="text-gray-900 text-3xl">{assistants.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Список пользователей */}
      <div className="space-y-4">
        {users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id} className="p-6 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-400 bg-white border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                    <User className="w-6 h-6 text-gray-700" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{user.name}</h3>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>
                          Добавлен {user.createdAt.toLocaleDateString('ru-RU', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {onEditUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {onDeleteUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl shadow-3d">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Пока нет пользователей</p>
            <p className="text-gray-500 text-sm">Добавьте менеджеров или помощников для работы с клиентами</p>
          </div>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Редактирование пользователя</DialogTitle>
            <DialogDescription className="text-gray-600">
              Измените данные пользователя {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-role" className="text-gray-900">
                Роль <span className="text-red-500">*</span>
              </Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as 'manager' | 'assistant')}>
                <SelectTrigger id="edit-user-role" className="rounded-2xl border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Менеджер</SelectItem>
                  <SelectItem value="assistant">Помощник администратора</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-gray-500 text-sm">
                {editRole === 'manager' 
                  ? 'Менеджер работает только со своими клиентами' 
                  : 'Помощник видит всех клиентов, но не может добавлять новых'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-name" className="text-gray-900">
                Имя <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="edit-user-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="pl-10 rounded-2xl border-gray-200 text-gray-900"
                />
              </div>
              {editErrors.name && (
                <p className="text-red-500 text-sm">{editErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-email" className="text-gray-900">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="user@school.com"
                  className="pl-10 rounded-2xl border-gray-200 text-gray-900"
                />
              </div>
              {editErrors.email && (
                <p className="text-red-500 text-sm">{editErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-password" className="text-gray-900">
                Новый пароль
              </Label>
              <Input
                id="edit-user-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Оставьте пустым, чтобы не менять"
                className="rounded-2xl border-gray-200 text-gray-900"
              />
              <p className="text-gray-500 text-sm">
                Оставьте поле пустым, если не хотите менять пароль
              </p>
              {editErrors.password && (
                <p className="text-red-500 text-sm">{editErrors.password}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditErrors({});
                }}
                className="flex-1 rounded-2xl border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-3d-cosmic hover:shadow-3d-hover transition-all duration-400"
              >
                Сохранить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}