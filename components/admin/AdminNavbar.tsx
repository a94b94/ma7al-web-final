"use client";

import { Bell, Search } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function AdminNavbar() {
  const { user } = useUser();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (notifOpen) {
      axios.get("/api/notifications").then((res) => {
        setNotifications(res.data || []);
      });
    }
  }, [notifOpen]);

  return (
    <header className="w-full bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
      {/* يسار: العنوان */}
      <div className="text-xl font-bold text-gray-800">📊 لوحة التحكم</div>

      {/* وسط: حقل البحث */}
      <div className="relative w-full max-w-md mx-6">
        <input
          type="text"
          placeholder="ابحث عن منتج أو طلب..."
          className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
      </div>

      {/* يمين: إشعارات وصورة المستخدم */}
      <div className="flex items-center gap-4 relative" ref={notifRef}>
        <button onClick={() => setNotifOpen(!notifOpen)} className="relative">
          <Bell className="text-gray-600 w-6 h-6" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {notifications.length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute top-10 right-0 bg-white shadow-md rounded-lg border w-72 p-3 z-50 max-h-80 overflow-y-auto text-sm">
            <p className="font-semibold text-gray-700 mb-2">🔔 الإشعارات</p>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">لا توجد إشعارات حالياً.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n, i) => (
                  <li key={i} className="border-b pb-2">
                    <p className="font-medium text-blue-700">{n.title || "إشعار"}</p>
                    <p className="text-gray-600">{n.message}</p>
                    <p className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {user?.storeLogo ? (
          <Image
            src={user.storeLogo}
            alt="شعار المتجر"
            width={40}
            height={40}
            className="rounded-full object-cover border"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
        )}
      </div>
    </header>
  );
}
