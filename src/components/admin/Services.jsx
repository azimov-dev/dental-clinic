import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import { apiClient } from "../../api/client";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export function Services() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // simple create/edit form
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [servicesRes, categoriesRes] = await Promise.all([
          apiClient("/services", { method: "GET", token }),
          apiClient("/service-categories", { method: "GET", token }),
        ]);

        setServices(Array.isArray(servicesRes) ? servicesRes : []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      } catch (err) {
        setError(err.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const categoriesById = useMemo(() => {
    const map = {};
    for (const c of categories) {
      map[c.id] = c;
    }
    return map;
  }, [categories]);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setCategoryId("");
  };

  const handleEdit = (service) => {
    setEditing(service);
    setName(service.name || "");
    setPrice(service.price || "");
    setCategoryId(service.category_id || service.categoryId || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const payload = {
      name,
      price: Number(price),
      category_id: categoryId || null,
    };

    try {
      setSaving(true);
      setError("");

      if (editing) {
        const updated = await apiClient(`/services/${editing.id}`, {
          method: "PUT",
          token,
          body: payload,
        });
        setServices((prev) =>
          prev.map((s) => (s.id === editing.id ? updated : s)),
        );
      } else {
        const created = await apiClient("/services", {
          method: "POST",
          token,
          body: payload,
        });
        setServices((prev) => [...prev, created]);
      }

      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Delete service "${service.name}"?`)) return;

    try {
      await apiClient(`/services/${service.id}`, {
        method: "DELETE",
        token,
      });
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch (err) {
      setError(err.message || "Failed to delete service");
    }
  };

  const getCategoryColor = (service) => {
    // service might have category object or category_id
    const category =
      service.category ||
      categoriesById[service.category_id] ||
      categoriesById[service.categoryId];

    const color = category?.color_hex || category?.color || "";

    if (!color) return null;
    // if it's a hex or rgb string, we'll use it directly
    return color;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr,1.3fr]">
      {/* Left: services table */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {t("services")}
            </h1>
            <p className="text-xs text-slate-500">{t("listOfServices")}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {services.length} {t("services").toLowerCase()}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">{t("services")}</th>
                <th className="px-3 py-2">{t("categories")}</th>
                <th className="px-3 py-2">{t("price")}</th>
                <th className="px-3 py-2 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-xs">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : services.length > 0 ? (
                services.map((s, idx) => {
                  const category =
                    s.category ||
                    categoriesById[s.category_id] ||
                    categoriesById[s.categoryId];
                  const color = getCategoryColor(s);

                  return (
                    <tr key={s.id}>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 text-xs">{s.name}</td>
                      <td className="px-3 py-2 text-xs">
                        {category ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: color || "#EEF2FF",
                              color: color ? "#0f172a" : "#4f46e5",
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                            {category.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {s.price} <span className="text-[10px]">so‘m</span>
                      </td>
                      <td className="px-3 py-2 text-right text-xs">
                        <button
                          type="button"
                          onClick={() => handleEdit(s)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          className="ml-2 rounded-lg border border-rose-200 px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50"
                        >
                          {t("common.delete")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-xs text-slate-400"
                  >
                    {t("noServices")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          {editing ? "Xizmatni tahrirlash" : `${t("addServices")}`}
        </h2>

        <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              {t("services")}
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                        focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("nameOfService")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                {t("price")}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                          focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                {t("categories")}
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                          focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
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
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm
                        hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
