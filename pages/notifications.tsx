"use client";

import useSWR, { mutate } from "swr";
import { useUser } from "@/context/UserContext";
import { Bell, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotificationsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const prevCountRef = useRef(0);

  const { data, error } = useSWR(
    user?.phone ? `/api/notifications/user?phone=${user.phone}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const handleMarkAllAsSeen = async () => {
    if (!user?.phone) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/mark-all-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone }),
      });
      if (res.ok) {
        toast.success("✅ تم تحديد جميع الإشعارات كمقروءة");
        mutate(`/api/notifications/user?phone=${user.phone}`);
      } else {
        toast.error("❌ فشل في التحديث");
      }
    } catch {
      toast.error("⚠️ حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.phone) return;
    fetch("/api/notifications/mark-seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: user.phone }),
    });
  }, [user?.phone]);

  useEffect(() => {
    if (data?.notifications) {
      const unseen = data.notifications.filter((n: any) => !n.seen);
      const currentCount = unseen.length;
      const previousCount = prevCountRef.current;

      if (currentCount > previousCount) {
        toast("🔔 لديك إشعار جديد!", {
          icon: "📩",
          duration: 4000,
        });
      }
      prevCountRef.current = currentCount;
    }
  }, [data]);

  if (!user?.phone) {
    return <p className="p-4 text-gray-600">🔒 يجب تسجيل الدخول لعرض الإشعارات.</p>;
  }

  if (error) return <p className="p-4 text-red-600">❌ حدث خطأ أثناء تحميل الإشعارات.</p>;
  if (!data) return <p className="p-4">🔄 جاري تحميل الإشعارات...</p>;

  const notifications = data.notifications;

  return (
    <div className="max-w-xl mx-auto p-6">
      <motion.div
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
          <Bell size={24} /> إشعاراتي
        </h1>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsSeen}
            className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
            disabled={loading}
          >
            <Check size={16} />
            تحديد الكل كمقروء
          </button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">لا توجد إشعارات بعد.</p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {notifications.map((notif: any) => (
              <motion.li
                key={notif._id}
                className={`p-4 border rounded shadow-sm ${
                  notif.seen ? "bg-white dark:bg-gray-800" : "bg-blue-50 border-blue-300"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {notif.title || "إشعار"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notif.createdAt).toLocaleString("ar-IQ", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
