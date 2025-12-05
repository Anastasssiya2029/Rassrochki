/**
 * Утилита для безопасного доступа к переменным окружения
 */

/**
 * Проверяет, подключен ли реальный API
 * @returns true - всегда используем реальный API
 */
export const isApiConnected = (): boolean => {
  return true;
};

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

/**
 * Проверяет, используется ли моковый API
 * @returns false - моки отключены
 */
export const useMockApi = (): boolean => {
  return false;
};
