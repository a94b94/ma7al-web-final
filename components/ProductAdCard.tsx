import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  description: string;
  specs: string[];
  price: number;
  storage: string;
  image: string;
  location: string;
  phone: string;
  link?: string;
};

export default function ProductAdCard({
  name,
  description,
  specs,
  price,
  storage,
  image,
  location,
  phone,
  link = "#",
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 max-w-4xl mx-auto mb-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* الصورة */}
        <div className="flex-1 text-center">
          <Image src={image} alt={name} width={400} height={300} className="rounded" />
        </div>

        {/* التفاصيل */}
        <div className="flex-1 space-y-2 text-right">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">{name}</h2>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>

          <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside">
            {specs.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            💰 {price.toLocaleString()} IQD - {storage}
          </p>

          <Link href={link}>
            <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm transition">
              🛒 اشترِ الآن
            </span>
          </Link>

          <p className="text-xs mt-3 text-gray-400">📍 {location}</p>
          <p className="text-xs text-gray-400">📞 {phone}</p>
        </div>
      </div>
    </div>
  );
}
