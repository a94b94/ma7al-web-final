import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  colorClass: string;
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Link href={`/category/${cat.slug}`} key={cat._id} legacyBehavior>
            <motion.a
              initial={false}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`relative flex items-center justify-center text-white h-48 rounded-2xl shadow-lg overflow-hidden ${cat.colorClass}`}
            >
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3 className="relative z-10 text-2xl font-bold">{cat.name}</h3>
            </motion.a>
          </Link>
        ))}
      </div>
    </section>
  );
}
