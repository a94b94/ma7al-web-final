import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Bell, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  seen?: boolean;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications?userId=admin");

      if (!Array.isArray(res.data)) {
        setError("❌ البيانات غير صالحة من السيرفر");
        setNotifications([]);
        return;
      }

      setNotifications(res.data);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setError("⚠️ فشل في جلب الإشعارات");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await axios.post("/api/notifications/mark-read", { userId: "admin" });
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    } catch {
      alert("⚠️ فشل في تمييز الإشعارات كمقروءة");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`/api/notifications/delete?id=${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert("⚠️ فشل في حذف الإشعار");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2 mb-6">
          <Bell /> إشعارات النظام
        </h1>

        {loading ? (
          <p className="text-gray-500">جارٍ التحميل...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">لا توجد إشعارات حالياً.</p>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <CheckCircle size={16} />
                تمييز الكل كمقروء
              </button>
            </div>

            <div className="grid gap-4">
              {notifications.map((note) => (
                <Card
                  key={note._id}
                  className={`border ${note.seen ? "bg-white" : "bg-yellow-50"} shadow-sm`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-700">{note.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(note.createdAt).toLocaleString("ar-EG")}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNotification(note._id)}
                        className="text-red-500 hover:text-red-700"
                        title="حذف الإشعار"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
