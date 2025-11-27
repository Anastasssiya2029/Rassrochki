import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

interface PostponePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostpone: (newDate: Date, reason: string, isOverdue: boolean) => void;
  currentDate: Date;
  amount: number;
}

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function PostponePaymentDialog({ 
  open, 
  onOpenChange, 
  onPostpone,
  currentDate,
  amount
}: PostponePaymentDialogProps) {
  const [newDate, setNewDate] = useState(formatDateForInput(currentDate));
  const [reason, setReason] = useState('');
  const [isOverdue, setIsOverdue] = useState(true);

  useEffect(() => {
    if (open) {
      setNewDate(formatDateForInput(currentDate));
    }
  }, [open, currentDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverdue && !reason.trim()) {
      return;
    }
    onPostpone(new Date(newDate), reason, isOverdue);
    onOpenChange(false);
    setReason('');
    setIsOverdue(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Перенос платежа</DialogTitle>
          <DialogDescription className="text-gray-600">
            Платеж на сумму {amount.toLocaleString('ru-RU')} ₽ будет перенесен.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label htmlFor="newDate" className="text-gray-900">Новая дата платежа</Label>
            <Input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="rounded-2xl h-12"
            />
            <p className="text-xs text-gray-500">
              Текущая дата платежа: {formatDateForInput(currentDate)}
            </p>
          </div>
          
          {isOverdue && (
            <div className="space-y-3">
              <Label htmlFor="reason" className="text-gray-900">Причина переноса</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Укажите причину переноса платежа"
                rows={4}
                className="rounded-2xl resize-none"
              />
            </div>
          )}

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
            <Checkbox
              id="isOverdue"
              checked={isOverdue}
              onCheckedChange={(checked) => setIsOverdue(checked === true)}
              className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="isOverdue" className="text-gray-900 cursor-pointer font-medium">
                Это просрочка
              </Label>
              <span className="text-xs text-gray-500">
                {isOverdue 
                  ? "Перенос будет записан в историю просрочек" 
                  : "Плановый перенос, не влияет на статус клиента"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-2xl px-6 h-12 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-3d-cosmic hover:shadow-3d-hover transition-all duration-400 hover:scale-105 rounded-2xl px-6 h-12"
            >
              Перенести платеж
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}