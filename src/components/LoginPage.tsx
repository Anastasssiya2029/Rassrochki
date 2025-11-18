import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LogIn, Sparkles } from 'lucide-react';
import { isApiConnected } from '../utils/env';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const apiConnected = isApiConnected();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setIsLoading(false);
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-300/40 animate-gradient">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-gray-900 mb-2">Вход в систему</h1>
            <p className="text-gray-600">Управление рассрочками онлайн-школ</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-900">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.com"
                required
                className="rounded-2xl h-12"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-900">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="rounded-2xl h-12"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-3d-cosmic hover:shadow-3d-hover transition-all duration-400 hover:scale-105 rounded-2xl h-12"
            >
              {isLoading ? (
                'Вход...'
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Войти
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нет аккаунта?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-purple-600 hover:text-pink-600 transition-colors font-semibold"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}