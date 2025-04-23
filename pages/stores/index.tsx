import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function StoreList() {
  const [stores, setStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/stores")
      .then((res) => res.json())
      .then((data) => {
        setStores(data);
        setFilteredStores(data);
      });
  }, []);

  useEffect(() => {
    const result = stores.filter((store) =>
      (store.storeName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStores(result);
  }, [searchQuery, stores]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🏬 استعرض المحلات المسجلة
      </h1>

      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="ابحث باسم المتجر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring focus:ring-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredStores.map((store) => (
          <motion.div
            key={store._id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow border hover:shadow-md p-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 shadow-inner mb-4 overflow-hidden">
                {store.storeLogo ? (
                  <Image
                    src={store.storeLogo}
                    alt={store.storeName}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                    🏪
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {store.storeName}
              </h3>

              <Link
                href={`/store/${store._id}`}
                className="text-blue-600 hover:underline text-sm mb-3"
              >
                عرض منتجات هذا المتجر
              </Link>

              <button
                onClick={() => {
                  localStorage.setItem("selectedStoreId", store._id);
                  localStorage.setItem("selectedStoreName", store.storeName);
                  alert(`✅ تم اختيار ${store.storeName} كمحل افتراضي`);
                  router.push("/");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm"
              >
                اختر هذا المحل
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <p className="text-center text-gray-500 mt-12">لا توجد نتائج مطابقة.</p>
      )}
    </div>
  );
}
