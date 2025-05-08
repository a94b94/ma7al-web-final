export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 py-6 text-sm text-center">
      <p className="text-slate-400">
        جميع الحقوق محفوظة © {new Date().getFullYear()}{" "}
        <span className="text-indigo-400 font-semibold">عبدالله التميمي</span>
      </p>
    </footer>
  );
}
