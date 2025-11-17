// API Service Layer для подключения к вашему бэкенду
// ВАЖНО: Замените API_BASE_URL на адрес вашего бэкенд-сервера

import { getApiUrl } from '../utils/env';

const API_BASE_URL = getApiUrl();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      user: any;
      token: string;
      school?: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    schoolName: string;
  }) {
    return this.request<{
      user: any;
      school: any;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Schools endpoints
  async getSchools() {
    return this.request<{ schools: any[] }>('/schools');
  }

  async getSchool(schoolId: string) {
    return this.request<any>(`/schools/${schoolId}`);
  }

  async createSchool(data: {
    schoolName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    return this.request<{ school: any; admin: any }>('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchool(schoolId: string, data: {
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
  }) {
    return this.request<{ school: any; admin: any }>(`/schools/${schoolId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSchool(schoolId: string) {
    return this.request<{ message: string }>(`/schools/${schoolId}`, {
      method: 'DELETE',
    });
  }

  // Clients endpoints
  async getClients(schoolId: string, managerId?: string) {
    const params = managerId ? `?managerId=${managerId}` : '';
    return this.request<{ clients: any[] }>(`/schools/${schoolId}/clients${params}`);
  }

  async createClient(schoolId: string, clientData: any) {
    return this.request<{ client: any }>(`/schools/${schoolId}/clients`, {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(schoolId: string, clientId: string, clientData: any) {
    return this.request<{ client: any }>(`/schools/${schoolId}/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async updatePaymentStatus(
    schoolId: string,
    clientId: string,
    paymentIndex: number,
    paid: boolean
  ) {
    return this.request(`/schools/${schoolId}/clients/${clientId}/payments/${paymentIndex}`, {
      method: 'PATCH',
      body: JSON.stringify({ paid }),
    });
  }

  async postponePayment(
    schoolId: string,
    clientId: string,
    paymentIndex: number,
    newDate: Date,
    reason: string
  ) {
    return this.request(`/schools/${schoolId}/clients/${clientId}/payments/${paymentIndex}/postpone`, {
      method: 'POST',
      body: JSON.stringify({ newDate, reason }),
    });
  }
}

export const apiService = new ApiService();