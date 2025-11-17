/**
 * Утилита для безопасного доступа к переменным окружения
 */

/**
 * Проверяет, подключен ли реальный API (есть ли REACT_APP_API_URL)
 * @returns true если API подключен, false если используются моки
 */
export const isApiConnected = (): boolean => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return !!process.env.REACT_APP_API_URL;
  }
  return false;
};

/**
 * Получает URL API или пустую строку для мокового режима
 * @returns URL API или пустая строка
 */
export const getApiUrl = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return '';
};

/**
 * Проверяет, используется ли моковый API
 * @returns true если используются моки, false если реальный API
 */
export const useMockApi = (): boolean => {
  return !isApiConnected();
};
