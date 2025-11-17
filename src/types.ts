export interface Payment {
  date: Date;
  amount: number;
  paid: boolean;
  originalDate?: Date; // Оригинальная дата, если платеж был перенесен
  postponeReason?: string; // Причина переноса платежа
  comment?: string; // Комментарий к платежу
}

export interface OverdueRecord {
  originalDate: Date;
  postponedDate: Date;
  reason: string;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  username: string;
  tariff: string;
  totalAmount: number;
  prepayment: number;
  prepaymentDate: Date; // Отдельная дата предоплаты
  installmentStart: Date;
  installmentEnd: Date;
  manager: string;
  status: 'reliable' | 'unreliable';
  payments: Payment[];
  overdueHistory: OverdueRecord[]; // История просрочек
}