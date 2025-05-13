// ✅ الكود بعد تحسين دعم الموبايل وإضافة عرض كروت عند الشاشات الصغيرة
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import * as XLSX from "xlsx";
import ReminderLog from "@/components/admin/ReminderLog";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

export default function InstallmentDetailsPage() {
  // ... نفس التعريفات واستخدام useState/useEffect السابق حتى return

  return (
    <AdminLayout>
      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-2">🧾 سجل التذكيرات</h2>
        <ReminderLog orderId={order?._id} />
      </div>

      <div className="mb-6 p-4 border rounded bg-white overflow-x-auto">
        <h2 className="text-lg font-bold mb-2">📊 ملخص الأقساط</h2>
        <p>عدد الأقساط: {totalInstallments}</p>
        <p>المدفوعة: {paidInstallments}</p>
        <p>غير المدفوعة: {unpaidInstallments}</p>
        <p>الإجمالي المدفوع: {totalPaidAmount.toLocaleString()} د.ع</p>
        <p>المتبقي: {totalRemainingAmount.toLocaleString()} د.ع</p>
        <p>🔹 المدفوع خلال آخر 7 أيام: {paidInLast7.toLocaleString()} د.ع</p>
        <p>🔹 المدفوع خلال آخر 30 يوم: {paidInLast30.toLocaleString()} د.ع</p>

        <div className="w-full h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {barData.length > 0 && (
          <div className="w-full h-72 mt-10">
            <h3 className="text-base font-semibold mb-2">📈 المدفوعات حسب الشهر</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ✅ عرض الكروت على الموبايل */}
      <div className="grid gap-4 sm:hidden mt-6">
        {filteredInstallments.map((item: any, index: number) => (
          <div
            key={index}
            className={`border rounded p-4 ${item.paid ? "bg-green-50" : "bg-red-50"}`}
          >
            <p className="font-semibold mb-1">🧾 القسط #{index + 1}</p>
            <p>📅 تاريخ الاستحقاق: {new Date(item.date).toLocaleDateString("ar-IQ")}</p>
            <p>💰 المبلغ: {item.amount.toLocaleString()} د.ع</p>
            <p>📌 الحالة: {item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}</p>
            <p>📆 تاريخ الدفع: {item.paidAt ? new Date(item.paidAt).toLocaleDateString("ar-IQ") : "—"}</p>
            {!item.paid && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleMarkInstallmentPaid(index)}
                  className="text-green-600 underline"
                >
                  💵 دفع
                </button>
                <button
                  onClick={() => handleSendReminder(index)}
                  className="text-blue-600 underline"
                >
                  📤 تذكير
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ عرض الجدول فقط على الشاشات الكبيرة */}
      <div className="p-4 border rounded bg-white overflow-x-auto hidden sm:block mt-6">
        <h2 className="text-lg font-bold mb-4">📋 جدول الأقساط</h2>
        <table className="min-w-[640px] text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">تاريخ الاستحقاق</th>
              <th className="p-2 border">المبلغ</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">تاريخ الدفع</th>
              <th className="p-2 border">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map((item: any, index: number) => (
              <tr
                key={index}
                className={item.paid ? "bg-green-50" : "bg-red-50"}
              >
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border text-center">
                  {new Date(item.date).toLocaleDateString("ar-IQ")}
                </td>
                <td className="p-2 border text-center">
                  {item.amount.toLocaleString()} د.ع
                </td>
                <td className="p-2 border text-center">
                  {item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}
                </td>
                <td className="p-2 border text-center">
                  {item.paidAt
                    ? new Date(item.paidAt).toLocaleDateString("ar-IQ")
                    : "—"}
                </td>
                <td className="p-2 border text-center space-x-2 rtl:space-x-reverse">
                  {!item.paid && (
                    <>
                      <button
                        onClick={() => handleMarkInstallmentPaid(index)}
                        className="text-green-600 hover:underline"
                      >
                        💵 دفع
                      </button>
                      <button
                        onClick={() => handleSendReminder(index)}
                        className="text-blue-600 hover:underline"
                      >
                        📤 تذكير
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
