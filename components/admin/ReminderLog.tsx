"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface LogEntry {
  _id: string;
  message: string;
  sentBy: string;
  customerPhone: string;
  createdAt: string;
  type: "auto" | "manual" | string;
}

export default function ReminderLog({ orderId }: { orderId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      axios
        .get(`/api/notifications/logs?orderId=${orderId}`)
        .then((res) => {
          setLogs(res.data.logs || []);
        })
        .catch(() => {
          setLogs([]);
        })
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading)
    return <p className="text-sm text-gray-600 animate-pulse">🔄 جاري تحميل سجل التذكيرات...</p>;

  if (!logs.length)
    return <p className="text-sm text-gray-500 italic">لا توجد تذكيرات مسجلة لهذا الطلب.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-300 text-right bg-white shadow rounded-md">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 border">📅 التاريخ</th>
            <th className="p-2 border">📨 الرسالة</th>
            <th className="p-2 border">📞 الرقم</th>
            <th className="p-2 border">👤 المرسل</th>
            <th className="p-2 border">⚙️ النوع</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="p-2 border">
                {new Date(log.createdAt).toLocaleString("ar-IQ", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="p-2 border whitespace-pre-wrap">{log.message || "—"}</td>
              <td className="p-2 border">{log.customerPhone || "—"}</td>
              <td className="p-2 border">{log.sentBy || "—"}</td>
              <td className="p-2 border text-xs text-gray-600 italic">
                {log.type === "auto"
                  ? "🔁 تلقائي"
                  : log.type === "manual"
                  ? "✋ يدوي"
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
