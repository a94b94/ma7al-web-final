
import dynamic from "next/dynamic";

// ✅ تحميل الصفحة الرئيسية بدون SSR
const HomePage = dynamic(() => import("@/components/HomePage"), { ssr: false });

export default function IndexPage() {
  return <HomePage />;
}
