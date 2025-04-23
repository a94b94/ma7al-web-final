import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/admin/notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]));
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2 mb-6">
          <Bell /> إشعارات النظام
        </h1>

        {notifications.length === 0 ? (
          <p className="text-gray-500">لا توجد إشعارات حالياً.</p>
        ) : (
          <div className="grid gap-4">
            {notifications.map((note) => (
              <Card key={note._id} className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {note.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{note.message}</p>
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
