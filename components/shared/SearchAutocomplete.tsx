// components/shared/SearchAutocomplete.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(() => {
      fetch(`/api/search?q=${query}`)
        .then((res) => res.json())
        .then((data) => setResults(data.products || []));
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (productId: string) => {
    router.push(`/product/${productId}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="🔍 ابحث عن منتج..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        className="w-full p-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showDropdown && results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 mt-1 rounded-lg z-50 max-h-64 overflow-y-auto shadow-md">
          {results.map((item) => (
            <li
              key={item._id}
              onClick={() => handleSelect(item._id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
