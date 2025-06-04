"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  CreditCard,
  Hash,
  CheckCircle,
  Bell,
  BadgeCheck,
  Clock3,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

type InstallmentTableProps = {
  totalAmount: number;
  downPayment: number;
  count: number;
  startDate: string;
  orderId: string;
  customerPhone: string;
};

type InstallmentRow = {
  number: number;
  date: string;
  amount: string;
};

export default function InstallmentTable({
  totalAmount,
  downPayment,
  count,
  startDate,
  orderId,
  customerPhone,
}: InstallmentTableProps) {
  const [paid, setPaid] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null); // لمنع الضغط مرتين

  useEffect(() => {
    axios
      .get(`/api/installments/status?orderId=${orderId}`)
      .then((res) => {
        setPaid(res.data.paidInstallments || []);
      })
      .catch(() => {
        toast.error("❌ فشل تحميل حالة الأقساط");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (count <= 0 || !startDate || totalAmount <= downPayment) return null;

  const remaining = totalAmount - downPayment;
  const perInstallment = Math.round(remaining / count);

  const rows: InstallmentRow[] = [];

  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null;

  const dateFormatter = new Intl.DateTimeFormat("ar-IQ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  for (let i = 0; i < count; i++) {
    const due = new Date(start);
    due.setMonth(due.getMonth() + i);
    rows.push({
      number: i + 1,
      date: dateFormatter.format(due),
      amount: perInstallment.toLocaleString("ar-IQ"),
    });
  }

  const handlePay = async (installmentNumber: number) => {
    if (paid.includes(installmentNumber)) return;

    try {
      await axios.post("/api/installments/pay", {
        orderId,
        number: installmentNumber,
        paidBy: "admin",
      });
      setPaid((prev) => [...prev, installmentNumber]);
      toast.success(`✅ تم تسجيل دفع القسط رقم ${installmentNumber}`);
    } catch {
      toast.error("❌ فشل تسجيل الدفع");
    }
  };

  const handleReminder = async (
    installmentNumber: number,
    date: string,
    amount: string
  ) => {
    setSending(installmentNumber);
    try {
      const message = `📢 تذكير: عليك القسط رقم ${installmentNumber} بتاريخ ${date} بمبلغ ${amount} د.ع`;
      await axios.post("/api/whatsapp/send", {
        phone: customerPhone,
        message,
        orderId,
        sentBy: "admin",
      });
      toast.success(`📤 تم إرسال التذكير للقسط رقم ${installmentNumber}`);
    } catch {
      toast.error("❌ فشل إرسال التذكير");
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        ⏳ جارٍ تحميل الأقساط...
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <h4 className="font-bold mb-2 text-purple-800 text-lg">📅 جدول الأقساط:</h4>
      {rows.map((item) => {
        const isPaid = paid.includes(item.number);
        return (
          <div
            key={item.number}
            className={`rounded-xl shadow-sm p-4 border ${
              isPaid
                ? "bg-green-50 border-green-300"
                : "bg-purple-50 border-purple-200"
            }`}
          >
            <div
              className={`text-sm font-semibold flex items-center gap-2 mb-1 ${
                isPaid ? "text-green-800" : "text-purple-800"
              }`}
            >
              <Hash size={16} /> القسط رقم {item.number}
            </div>

            <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
              <CalendarDays size={16} /> تاريخ الاستحقاق: {item.date}
            </div>

            <div className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <CreditCard size={16} /> المبلغ:{" "}
              <span className="font-bold">{item.amount} د.ع</span>
            </div>

            <div
              className={`text-xs font-semibold flex items-center gap-1 mb-3 ${
                isPaid ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {isPaid ? <BadgeCheck size={14} /> : <Clock3 size={14} />} حالة
              القسط: {isPaid ? "مدفوع" : "متبقي"}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handlePay(item.number)}
                disabled={isPaid}
                className="flex-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <CheckCircle size={14} /> تم الدفع
              </button>

              {!isPaid && (
                <button
                  onClick={() =>
                    handleReminder(item.number, item.date, item.amount)
                  }
                  disabled={sending === item.number}
                  className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Bell size={14} /> {sending === item.number ? "جارٍ الإرسال..." : "إرسال تذكير"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
