import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }: { product: any }) {
  const priceAfterDiscount = product.discount
    ? product.price - product.price * (product.discount / 100)
    : product.price;

  return (
    <Link href={`/product/${product._id}`}>
      <div className="relative bg-[#1e293b] rounded-lg overflow-hidden text-white hover:shadow-lg transition">
        {/* ✅ صورة المنتج */}
        <div className="relative h-32">
          <Image
            src={product.image || "/images/default.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {/* ✅ بادج خصم */}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
              خصم {product.discount}%
            </div>
          )}
        </div>

        {/* ✅ تفاصيل المنتج */}
        <div className="p-2">
          <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>
          <p className="text-[#3b82f6] font-bold text-sm">
            {priceAfterDiscount.toLocaleString()} د.ع
          </p>
          {product.discount > 0 && (
            <span className="text-xs text-slate-400 line-through">
              {product.price.toLocaleString()} د.ع
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
