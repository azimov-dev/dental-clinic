// src/pages/CategoriesPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import { apiClient } from "../../api/client";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function CategoriesPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  // Data
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [editing, setEditing] = useState(null); // null or category object
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#3B82F6"); // default blue
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // -------------------------------------------------
  // Load categories
  // -------------------------------------------------
  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiClient("/service-categories", {
          method: "GET",
          token,
        });
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || t("common.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, t]);

  // -------------------------------------------------
  // Form helpers
  // -------------------------------------------------
  const resetForm = () => {
    setEditing(null);
    setName("");
    setColorHex("#3B82F6");
    setIsActive(true);
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setName(cat.name || "");
    setColorHex(cat.color_hex || "#3B82F6");
    setIsActive(!!cat.is_active);
  };

  // -------------------------------------------------
  // Submit (create / update)
  // -------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      color_hex: colorHex,
      is_active: isActive,
    };

    try {
      setSaving(true);
      setError("");

      if (editing) {
        // Update
        const updated = await apiClient(`/service-categories/${editing.id}`, {
          method: "PUT",
          token,
          body: payload,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? updated : c)),
        );
      } else {
        // Create
        const created = await apiClient("/service-categories", {
          method: "POST",
          token,
          body: payload,
        });
        setCategories((prev) => [...prev, created]);
      }

      resetForm();
    } catch (err) {
      setError(err.message || t("common.errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------
  // Delete
  // -------------------------------------------------
  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `${cat.name}${t("category.confirmDelete", { name: cat.name })}`,
      )
    )
      return;

    try {
      await apiClient(`/service-categories/${cat.id}`, {
        method: "DELETE",
        token,
      });
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      setError(err.message || t("common.errorDeleting"));
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr,1.3fr]">
      {/* Left: categories table */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {t("categories")}
            </h1>
            <p className="text-xs text-slate-500">{t("category.subtitle")}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {categories.length} {t("categories").toLowerCase()}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">{t("category.name")}</th>
                <th className="px-3 py-2">{t("category.color")}</th>
                <th className="px-3 py-2">{t("common.status")}</th>
                <th className="px-3 py-2 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-xs">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-xs text-slate-400"
                  >
                    {t("category.noCategory")}
                  </td>
                </tr>
              ) : (
                categories.map((c, idx) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 text-xs">{c.name}</td>
                    <td className="px-3 py-2">
                      <div
                        className="inline-block h-5 w-12 rounded"
                        style={{ backgroundColor: c.color_hex || "#ccc" }}
                      />
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {c.is_active ? (
                        <span className="text-green-600">
                          {t("common.active")}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {t("common.inactive")}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="ml-2 rounded-lg border border-rose-200 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50"
                      >
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: add / edit form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          {editing ? t("category.editTitle") : t("category.addTitle")}
        </h2>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              {t("category.name")}
            </label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("category.namePlaceholder")}
            />
          </div>

          {/* Color + Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Color picker */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                {t("category.color")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-500"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                {t("common.status")}
              </label>
              <select
                value={isActive ? "1" : "0"}
                onChange={(e) => setIsActive(e.target.value === "1")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-sky-500"
              >
                <option value="1">{t("common.active")}</option>
                <option value="0">{t("common.inactive")}</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                {t("cancel")}
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {saving ? t("common.saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
