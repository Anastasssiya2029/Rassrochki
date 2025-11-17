import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { DialogDescription } from './ui/dialog';
import { Client } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar, DollarSign } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';
import { PostponePaymentDialog } from './PostponePaymentDialog';

interface DayPayment {
  client: Client;
  paymentIndex: number;
  payment: {
    date: Date;
    amount: number;
    paid: boolean;
    originalDate?: Date;
    postponeReason?: string;
    comment?: string;
  };
}

interface DayDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  payments: DayPayment[];
  onTogglePayment: (clientId: string, paymentIndex: number) => void;
  onPostponePayment: (clientId: string, paymentIndex: number, newDate: Date, reason: string) => void;
  onPaymentAmountChange: (clientId: string, paymentIndex: number, newAmount: number) => void;
  onCommentChange: (clientId: string, paymentIndex: number, comment: string) => void;
}

const formatDateLong = (date: Date) => {
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const weekDays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return `${weekDays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export function DayDetailsDialog({
  open,
  onOpenChange,
  date,
  payments,
  onTogglePayment,
  onPostponePayment,
  onPaymentAmountChange,
  onCommentChange
}: DayDetailsDialogProps) {
  const [editingAmountIndex, setEditingAmountIndex] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editingCommentIndex, setEditingCommentIndex] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<DayPayment | null>(null);

  const totalAmount = payments.reduce((sum, p) => sum + p.payment.amount, 0);
  const paidAmount = payments.filter(p => p.payment.paid).reduce((sum, p) => sum + p.payment.amount, 0);

  const handleEditAmountClick = (key: string, currentAmount: number) => {
    setEditingAmountIndex(key);
    setEditAmount(currentAmount.toString());
  };

  const handleSaveAmount = (clientId: string, paymentIndex: number) => {
    const newAmount = parseFloat(editAmount);
    if (!isNaN(newAmount) && newAmount > 0) {
      onPaymentAmountChange(clientId, paymentIndex, newAmount);
    }
    setEditingAmountIndex(null);
  };

  const handleEditCommentClick = (key: string, currentComment: string = '') => {
    setEditingCommentIndex(key);
    setEditComment(currentComment);
  };

  const handleSaveComment = (clientId: string, paymentIndex: number) => {
    onCommentChange(clientId, paymentIndex, editComment);
    setEditingCommentIndex(null);
  };

  const handlePostponeClick = (payment: DayPayment) => {
    setSelectedPayment(payment);
    setPostponeDialogOpen(true);
  };

  const handlePostpone = (newDate: Date, reason: string) => {
    if (selectedPayment) {
      onPostponePayment(selectedPayment.client.id, selectedPayment.paymentIndex, newDate, reason);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-purple-200/50 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#2D1B69]">
              {formatDateLong(date)}
            </DialogTitle>
            <DialogDescription className="text-[#263238]/70">
              Детальная информация о платежах на выбранную дату
            </DialogDescription>
          </DialogHeader>

          {/* Summary */}
          {payments.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100/50 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[#263238]/70 mb-1 font-semibold">Всего платежей:</p>
                  <p className="text-[#2D1B69]">{payments.length}</p>
                </div>
                <div>
                  <p className="text-[#263238]/70 mb-1 font-semibold">Сумма ожидается:</p>
                  <p className="text-[#2D1B69]">{totalAmount.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div>
                  <p className="text-[#263238]/70 mb-1 font-semibold">Оплачено:</p>
                  <p className="text-green-600">{paidAmount.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
            </div>
          )}

          {/* Payments List */}
          <div className="space-y-3">
            {payments.map((item, index) => {
              const key = `${item.client.id}-${item.paymentIndex}`;
              const isEditingAmount = editingAmountIndex === key;
              const isEditingComment = editingCommentIndex === key;
              const isPostponed = item.payment.originalDate !== undefined;

              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    item.payment.paid
                      ? 'bg-green-50/80 border-green-200/50'
                      : 'bg-white/80 border-purple-200/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={item.payment.paid}
                        onCheckedChange={() => onTogglePayment(item.client.id, item.paymentIndex)}
                        className="mt-1 rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[#2D1B69]">
                            {item.client.name}
                          </h4>
                          {isPostponed && <span>🙏</span>}
                        </div>
                        <p className="text-[#263238]/70">{item.client.username}</p>
                        <p className="text-[#263238]/70"><span className="font-semibold">Менеджер:</span> {item.client.manager}</p>
                        {isPostponed && item.payment.postponeReason && (
                          <p className="text-[#263238] mt-1">
                            <span className="font-semibold">Причина переноса:</span> {item.payment.postponeReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {isEditingAmount ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-32 h-8 rounded-lg"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveAmount(item.client.id, item.paymentIndex)}
                            className="h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingAmountIndex(null)}
                            className="h-8 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <p className={`${item.payment.paid ? 'text-green-600' : 'text-[#2D1B69]'}`}>
                            {item.payment.amount.toLocaleString('ru-RU')} ₽
                          </p>
                          {!item.payment.paid && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAmountClick(key, item.payment.amount)}
                                title="Редактировать сумму"
                                className="h-8 text-[#263238]/70 hover:text-[#263238] hover:bg-purple-100/30 rounded-xl"
                              >
                                <DollarSign className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePostponeClick(item)}
                                title="Перенести платеж"
                                className="h-8 text-[#263238]/70 hover:text-[#263238] hover:bg-purple-100/30 rounded-xl"
                              >
                                <Calendar className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="mt-3 pt-3 border-t border-purple-200/30">
                    {isEditingComment ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="Добавить комментарий..."
                          className="min-h-[80px] rounded-lg bg-white/80"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveComment(item.client.id, item.paymentIndex)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          >
                            Сохранить
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCommentIndex(null)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {item.payment.comment ? (
                          <div className="bg-purple-50/50 p-3 rounded-lg">
                            <p className="text-[#263238]/70 mb-1 font-semibold">Комментарий:</p>
                            <p className="text-[#2D1B69]">{item.payment.comment}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditCommentClick(key, item.payment.comment)}
                              className="mt-2 text-[#263238]/70 hover:text-[#263238] rounded-lg"
                            >
                              Редактировать
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCommentClick(key)}
                            className="text-[#263238]/70 hover:text-[#263238] hover:bg-purple-100/30 rounded-lg"
                          >
                            + Добавить комментарий
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8 text-[#263238]/70">
              Нет платежей на эту дату
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedPayment && (
        <PostponePaymentDialog
          open={postponeDialogOpen}
          onOpenChange={setPostponeDialogOpen}
          onPostpone={handlePostpone}
          currentDate={selectedPayment.payment.date}
          amount={selectedPayment.payment.amount}
        />
      )}
    </>
  );
}