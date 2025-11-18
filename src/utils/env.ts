/**
 * Утилита для безопасного доступа к переменным окружения
 */

/**
 * Проверяет, подключен ли реальный API
 * @returns true если API подключен, false если используются моки
 */
export const isApiConnected = (): boolean => {
  // Если установлена переменная VITE_API_URL, используем её
  if (import.meta.env.VITE_API_URL) {
    return true;
  }
  // Иначе используем прокси Vite (в dev режиме backend доступен через /api)
  return import.meta.env.MODE === 'development';
};

/**
 * Получает URL API или пустую строку для мокового режима
 * @returns URL API или пустая строка
 */
export const getApiUrl = (): string => {
  // Если явно указан URL API, используем его
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // В dev режиме используем прокси (запросы к /api будут проксироваться на localhost:3001)
  if (import.meta.env.MODE === 'development') {
    return '/api';
  }
  // В остальных случаях моковый режим
  return '';
};

/**
 * Проверяет, используется ли моковый API
 * @returns true если используются моки, false если реальный API
 */
export const useMockApi = (): boolean => {
  return !isApiConnected();
};
