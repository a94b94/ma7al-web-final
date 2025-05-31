import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  PlusCircle,
  LogOut,
  Bell,
  User,
  Search,
  QrCode,
  FilePlus,
  ShieldCheck,
  Settings,
  CreditCard,
  FileBarChart,
  Megaphone
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = [
    { label: "لوحة التحكم", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "الإشعارات", href: "/admin/notifications", icon: <Bell size={18} /> },
    { label: "المنتجات", href: "/admin/products", icon: <Package size={18} /> },
    { label: "📦 المخزن", href: "/admin/inventory", icon: <Package size={18} /> },
    { label: "الطلبات", href: "/admin/orders", icon: <ShoppingCart size={18} /> },
    { label: "قائمة الأقساط", href: "/admin/installments", icon: <CreditCard size={18} /> },
    { label: "📈 التقارير المالية", href: "/admin/analytics", icon: <FileBarChart size={18} /> },
    { label: "إضافة منتج", href: "/admin/add-product", icon: <PlusCircle size={18} /> },
    { label: "📝 إنشاء إعلان", href: "/admin/create-ad", icon: <Megaphone size={18} /> },
    { label: "توليد فاتورة", href: "/admin/local-sale", icon: <FilePlus size={18} /> },
    { label: "قائمة الزبائن", href: "/admin/customers", icon: <User size={18} /> },
    { label: "ربط واتساب", href: "/admin/qr", icon: <QrCode size={18} /> },
    { label: "إعدادات المتجر", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  if (user?.role === "owner") {
    navItems.splice(8, 0, {
      label: "إدارة المشرفين",
      href: "/admin/users",
      icon: <ShieldCheck size={18} />,
    });
  }

  return (
    <div className="min-h-screen flex font-sans text-gray-900 bg-gray-50">
      <aside className="w-64 bg-white border-r shadow-md p-4 flex flex-col justify-between">
        <div>
          <h1
            className="text-xl font-bold mb-6 text-blue-700 text-center cursor-pointer"
            onClick={() => router.push("/admin")}
          >
            🧩 إدارة المتجر
          </h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
                    router.pathname === item.href
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between px-2 text-gray-600 text-sm">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <User size={18} />
              {user?.name || "المشرف"}
            </div>
            <button onClick={() => setNotifOpen(!notifOpen)} className="hover:text-blue-600">
              <Bell size={18} />
            </button>
          </div>

          {menuOpen && (
            <div className="mt-2 bg-gray-100 p-3 rounded-lg text-sm text-gray-800">
              <p className="mb-2">مرحباً، {user?.name}</p>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <LogOut size={18} />
                تسجيل الخروج
              </button>
            </div>
          )}

          {notifOpen && (
            <div className="mt-2 bg-white p-3 rounded-lg shadow text-sm border text-gray-700">
              <p className="font-semibold">🔔 الإشعارات</p>
              <p className="mt-1">لا توجد إشعارات جديدة حالياً.</p>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="w-full bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
          <div className="text-xl font-bold text-gray-800">📊 لوحة التحكم</div>

          <div className="relative w-full max-w-md mx-6">
            <input
              type="text"
              placeholder="ابحث عن منتج أو طلب..."
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
          </div>
        </header>

        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
