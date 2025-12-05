import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { useAuth } from "../../features/auth/useAuth";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function CategoriesPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiClient("/service-categories", { token });
        setCategories(data || []);
      } catch (err) {
        setError(err.message || "Yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          {t("categories")}
        </h1>
        <p className="text-xs text-slate-500">
          Klinikadagi barcha xizmatlar kategoriyalari ro&apos;yxati.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Nomi</th>
                <th className="px-4 py-2">Holati</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-center text-xs" colSpan={3}>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-center text-xs" colSpan={3}>
                    Hozircha kategoriya yo&apos;q
                  </td>
                </tr>
              ) : (
                categories.map((c, idx) => (
                  <tr key={c.id || idx} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2 text-xs">
                      {c.is_active ? "Faol" : "Nofaol"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
