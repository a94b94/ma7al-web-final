import { useEffect, useState } from "react";
import axios from "axios";

interface LogEntry {
  _id: string;
  message: string;
  sentBy: string;
  customerPhone: string;
  createdAt: string;
  type: string;
}

export default function ReminderLog({ orderId }: { orderId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      axios.get(`/api/notifications/logs?orderId=${orderId}`).then((res) => {
        setLogs(res.data.logs || []);
        setLoading(false);
      });
    }
  }, [orderId]);

  if (loading) return <p>🔄 جاري تحميل السجل...</p>;
  if (!logs.length) return <p className="text-gray-500">لا يوجد تذكيرات مسجلة.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border text-right">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">📅 التاريخ</th>
            <th className="p-2 border">📨 الرسالة</th>
            <th className="p-2 border">📞 الرقم</th>
            <th className="p-2 border">👤 المرسل</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="p-2 border">
                {new Date(log.createdAt).toLocaleString("ar-IQ")}
              </td>
              <td className="p-2 border whitespace-pre-wrap">
                {log.message || "—"}
              </td>
              <td className="p-2 border">{log.customerPhone || "—"}</td>
              <td className="p-2 border">{log.sentBy || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
