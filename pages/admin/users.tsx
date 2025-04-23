import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  storeName: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editedRoles, setEditedRoles] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setEditedRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    const updates = Object.entries(editedRoles);

    for (const [userId, newRole] of updates) {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "❌ خطأ في تعديل صلاحية المستخدم");
        return;
      }
    }

    toast.success("✅ تم حفظ التعديلات");
    setEditedRoles({});
    fetchUsers();
  };

  const filteredUsers = filter === "all" ? users : users.filter((u) => u.role === filter);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-800">👥 إدارة المشرفين</h1>
          <div className="flex gap-2">
            <select
              className="border rounded px-3 py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">الكل</option>
              <option value="owner">المالك</option>
              <option value="manager">مدير</option>
              <option value="support">دعم فني</option>
            </select>
            {Object.keys(editedRoles).length > 0 && (
              <Button onClick={handleSaveChanges}>💾 حفظ التعديلات</Button>
            )}
          </div>
        </div>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white shadow rounded p-4 space-y-1">
                <h3 className="font-bold text-lg">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">🏪 {user.storeName}</p>
                <p className="text-sm text-indigo-700">
                  الصلاحية الحالية:{" "}
                  <span className="font-semibold">{editedRoles[user._id] || user.role}</span>
                </p>

                <select
                  value={editedRoles[user._id] || user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  className="mt-2 border px-2 py-1 rounded text-sm"
                >
                  <option value="owner">المالك</option>
                  <option value="manager">مدير</option>
                  <option value="support">دعم فني</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
