import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { useAuth } from "../../features/auth/useAuth";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function DailyReportsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   const load = async () => {
  //     try {
  //       setLoading(true);
  //       setError("");
  //       const data = await apiClient("/reports/daily", { token });
  //       setRows(data || []);
  //     } catch (err) {
  //       setError(err.message || "Yuklashda xatolik");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (token) load();
  // }, [token]);

  const total = rows.reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {t("dailyReports")}
          </h1>
          <p className="text-xs text-slate-500">
            Qabul va davolashlar bo&apos;yicha kunlik tushumlar.
          </p>
        </div>
        <div className="rounded-xl bg-sky-50 px-4 py-2 text-xs text-sky-700">
          Jami: <span className="font-semibold">{total} so&apos;m</span>
        </div>
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
                <th className="px-4 py-2">Sana</th>
                <th className="px-4 py-2">Bemor</th>
                <th className="px-4 py-2">Doktor</th>
                <th className="px-4 py-2">Summa</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-center text-xs" colSpan={5}>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-center text-xs" colSpan={5}>
                    Hozircha hisobot yo&apos;q
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.id || idx} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-2">{row.patient_name}</td>
                    <td className="px-4 py-2">{row.doctor_name}</td>
                    <td className="px-4 py-2">{row.amount} so&apos;m</td>
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
