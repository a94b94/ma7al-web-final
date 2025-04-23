import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, storeName, email, password, role }),
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const error = await res.json();
      alert(error.error || 'حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded-xl shadow-md w-full max-w-md" onSubmit={handleSignup}>
        <h2 className="text-2xl font-semibold mb-4">إنشاء حساب مشرف</h2>

        <input
          type="text"
          placeholder="اسم المشرف"
          className="w-full p-2 border rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="اسم المتجر"
          className="w-full p-2 border rounded mb-4"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-2 border rounded mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="owner">صاحب المتجر</option>
          <option value="manager">مدير</option>
          <option value="support">دعم فني</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          تسجيل الحساب
        </button>
      </form>
    </div>
  );
}
