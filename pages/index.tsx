"use client";

import Navbar from "@/components/shared/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ProductSlider from "@/components/ProductSlider";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const { addToCart } = useCart();
  const [discountProducts, setDiscountProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products/discount")
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setDiscountProducts(data) : []))
      .catch(() => setDiscountProducts([]));

    fetch("/api/products/new")
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setNewProducts(data) : []))
      .catch(() => setNewProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <Navbar />
      <HeroSection />
      <CategoriesSection />

      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-10 mb-4 text-center">
          🔥 المنتجات المميزة
        </h2>
        <ProductSlider products={discountProducts} loading={loading} onAddToCart={handleAddToCart} />

        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mt-10 mb-4 text-center">
          🆕 وصل حديثًا
        </h2>
        <ProductSlider products={newProducts} loading={loading} onAddToCart={handleAddToCart} />
      </section>

      <Footer />
    </div>
  );
}
