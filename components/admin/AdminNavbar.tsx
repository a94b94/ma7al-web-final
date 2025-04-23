import { Bell, Search } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/pages/_app";

export default function AdminNavbar() {
  const { user } = useUser();

  return (
    <header className="w-full bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
      {/* يسار: الشعار أو العنوان */}
      <div className="text-xl font-bold text-gray-800">📊 لوحة التحكم</div>

      {/* وسط: البحث */}
      <div className="relative w-full max-w-md mx-6">
        <input
          type="text"
          placeholder="ابحث عن منتج أو طلب..."
          className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
      </div>

      {/* يمين: إشعارات وصورة المستخدم */}
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="text-gray-600 w-6 h-6" />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">3</span>
        </button>

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
