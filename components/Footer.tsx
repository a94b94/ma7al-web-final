// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="border-t border-white/5 bg-[#0f172a] text-slate-400"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-center sm:text-right">
            جميع الحقوق محفوظة © {year}{" "}
            <span className="text-indigo-300 font-semibold">عبدالله التميمي</span>
          </p>

          <nav
            aria-label="روابط التذييل"
            className="flex items-center justify-center sm:justify-end gap-4 text-sm"
          >
            <Link href="/privacy" className="hover:text-slate-200 transition">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-slate-200 transition">
              الشروط والأحكام
            </Link>
            <Link href="/contact" className="hover:text-slate-200 transition">
              تواصل
            </Link>
          </nav>
        </div>

        <div className="mt-6 text-xs text-slate-500 text-center sm:text-right">
          Ma7al Store — تسوّق من أفضل المحلات.
        </div>
      </div>
    </footer>
  );
}
