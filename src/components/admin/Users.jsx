import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { apiClient } from "../../api/client.js";
import { useAuth } from "../../features/auth/useAuth";

const ROLES = ["admin", "doctor", "receptionist"];

export function Users() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    role: "doctor",
    password: "",
  });

  // LOAD USERS FROM BACKEND
  useEffect(() => {
    if (!token) return;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiClient("/admin/users", {
          method: "GET",
          token,
        });

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("loadUsers error", err);
        setError("Foydalanuvchilarni yuklashda xatolik.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [token]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      full_name: "",
      phone: "",
      role: "doctor",
      password: "",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      phone: user.phone || "",
      role: user.role || "doctor",
      password: "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setSaving(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Token topilmadi. Iltimos qayta tizimga kiring.");
      return;
    }

    if (!formData.full_name || !formData.phone || !formData.role) {
      setError("Ism, telefon va rol majburiy.");
      return;
    }

    if (!editingUser && !formData.password) {
      setError("Yangi foydalanuvchi uchun parol kiriting.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingUser) {
        // UPDATE EXISTING USER
        const updated = await apiClient(`/admin/users/${editingUser.id}`, {
          method: "PUT",
          token,
          body: {
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
          },
        });

        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? updated : u)),
        );
      } else {
        // CREATE NEW USER
        const created = await apiClient("/admin/users", {
          method: "POST",
          token,
          body: {
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
            password: formData.password,
          },
        });

        setUsers((prev) => [...prev, created]);
      }

      closeModal();
    } catch (err) {
      console.error("save user error", err);
      setError("Foydalanuvchini saqlashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    if (!token) return;
    if (!window.confirm(`"${user.full_name}" foydalanuvchini o'chirasizmi?`))
      return;

    try {
      await apiClient(`/admin/users/${user.id}`, {
        method: "DELETE",
        token,
      });

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error("delete user error", err);
      setError("Foydalanuvchini o'chirishda xatolik.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Users</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage doctors and reception staff
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add User
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No users yet. Add some staff members.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-6 py-3 text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-3 text-gray-800">{user.phone}</td>
                    <td className="px-6 py-3 text-gray-800">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        <Shield className="h-3.5 w-3.5" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => openEditModal(user)}
                        className="mr-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg text-gray-900">
                {editingUser ? "Edit User" : "Add User"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Full Name
                </label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Phone
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-gray-500">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Initial password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {saving
                    ? editingUser
                      ? "Saving..."
                      : "Creating..."
                    : editingUser
                    ? "Save"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
