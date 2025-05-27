"use client";

import React from "react";

type InstallmentTableProps = {
  totalAmount: number;
  downPayment: number;
  count: number;
  startDate: string;
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
}: InstallmentTableProps) {
  if (count <= 0 || !startDate || totalAmount <= downPayment) return null;

  const remaining = totalAmount - downPayment;
  const perInstallment = Math.round(remaining / count);

  const rows: InstallmentRow[] = [];

  const start = new Date(startDate);
  if (isNaN(start.getTime())) return null; // تأكيد أن التاريخ صالح

  for (let i = 0; i < count; i++) {
    const due = new Date(start);
    due.setMonth(due.getMonth() + i);

    const formattedDate = `${due.getDate().toString().padStart(2, "0")}/${(due.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${due.getFullYear()}`;

    rows.push({
      number: i + 1,
      date: formattedDate,
      amount: perInstallment.toLocaleString("ar-IQ"),
    });
  }

  return (
    <div className="mt-6 bg-gray-50 border rounded p-4">
      <h4 className="font-bold mb-2">📅 جدول الأقساط:</h4>
      <table className="w-full border text-sm text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">#</th>
            <th className="p-2 border">تاريخ الاستحقاق</th>
            <th className="p-2 border">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.number}>
              <td className="p-2 border">{item.number}</td>
              <td className="p-2 border">{item.date}</td>
              <td className="p-2 border">{item.amount} د.ع</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
