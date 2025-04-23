import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";

export default function StoreProductsPage({ products, storeName }: { products: any[]; storeName: string }) {
  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">
        🏪 منتجات متجر {storeName}
      </h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">لا توجد منتجات لهذا المتجر حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link key={product._id} href={`/product/${product._id}`}>
              <div className="bg-white border rounded-lg shadow hover:shadow-md p-4 text-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="object-contain w-full h-48 mx-auto"
                />
                <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                <p className="text-blue-600 font-bold mt-1">
                  {product.price.toLocaleString()} د.ع
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/by-store/${id}`);
  const products = await res.json();

  // نجلب اسم المتجر لعرضه في العنوان
  const storeRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stores`);
  const stores = await storeRes.json();
  const store = stores.find((s: any) => s._id === id);

  return {
    props: {
      products,
      storeName: store?.storeName || "غير معروف",
    },
  };
};
