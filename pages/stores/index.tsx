"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function StoreList() {
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("الكل");
  const [sortOption, setSortOption] = useState("latest");
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
    let result = [...stores];

    if (searchQuery) {
      result = result.filter((store) =>
        (store.storeName || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (regionFilter !== "الكل") {
      result = result.filter((store) => store.region === regionFilter);
    }

    if (sortOption === "latest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === "popular") {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    setFilteredStores(result);
  }, [searchQuery, regionFilter, sortOption, stores]);

  const uniqueRegions = ["الكل", ...Array.from(new Set(stores.map((s) => s.region)))];

  const handleSelectStore = (store: any) => {
    localStorage.setItem("selectedStoreId", store._id);
    localStorage.setItem("selectedStoreName", store.storeName);
    alert(`✅ تم اختيار ${store.storeName} كمحل افتراضي`);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft size={18} />
        <span>رجوع</span>
      </button>

      <motion.h1
        className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🏬 استعرض المحلات المسجلة
      </motion.h1>

      {/* البحث والتصفية */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          placeholder="ابحث باسم المتجر..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border shadow-sm dark:bg-gray-800 dark:text-white"
        />

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
        >
          {uniqueRegions.map((region) => (
            <option key={region} value={region}>
              📍 {region}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border dark:bg-gray-800 dark:text-white"
        >
          <option value="latest">🆕 الأحدث</option>
          <option value="popular">🔥 الأكثر شهرة</option>
        </select>
      </div>

      {/* عرض المحلات */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {filteredStores.map((store) => (
          <motion.div
            key={store._id}
            whileHover={{ scale: 1.03 }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow hover:shadow-md p-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 shadow-inner mb-4 overflow-hidden">
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

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                {store.storeName}
              </h3>

              <p className="text-gray-500 text-sm mb-1">
                🛒 عدد المنتجات: <span className="font-bold">{store.productCount || 0}</span>
              </p>

              <p className="text-gray-500 text-sm mb-2">
                📍 {store.region || "غير محدد"}
              </p>

              <Link href={`/store/${store._id}`} className="text-blue-600 hover:underline text-sm mb-2">
                عرض منتجات هذا المتجر
              </Link>

              <button
                onClick={() => handleSelectStore(store)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm"
              >
                اختر هذا المحل
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredStores.length === 0 && (
        <motion.p
          className="text-center text-gray-500 dark:text-gray-400 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          لا توجد نتائج مطابقة.
        </motion.p>
      )}
    </div>
  );
}
