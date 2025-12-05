/**
 * Утилита для безопасного доступа к переменным окружения
 */

/**
 * Получает URL API
 * @returns URL API для прокси
 */
export const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
};
