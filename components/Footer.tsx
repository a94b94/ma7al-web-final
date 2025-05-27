"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="bg-[#0f172a] text-slate-400 py-6 text-sm text-center"
    >
      <p>
        جميع الحقوق محفوظة © {year}{" "}
        <span className="text-indigo-400 font-semibold">
          عبدالله التميمي
        </span>
      </p>
    </footer>
  );
}
