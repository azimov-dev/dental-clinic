import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { useAuth } from "../../features/auth/useAuth";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function DebtsPage() {
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
  //       // adjust endpoint if needed
  //       const data = await apiClient("/treatments/debts", { token });
  //       setRows(data || []);
  //     } catch (err) {
  //       setError(err.message || "Yuklashda xatolik");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (token) load();
  // }, [token]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{t("debts")}</h1>
        <p className="text-xs text-slate-500">
          Qisman to&apos;langan yoki to&apos;lanmagan davolashlar ro&apos;yxati.
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
                <th className="px-4 py-2">Bemor</th>
                <th className="px-4 py-2">Doktor</th>
                <th className="px-4 py-2">Sana</th>
                <th className="px-4 py-2">Qarz summasi</th>
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
                    Qarzdor davolashlar yo&apos;q
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={row.id || idx} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2">{row.patient_name}</td>
                    <td className="px-4 py-2">{row.doctor_name}</td>
                    <td className="px-4 py-2 text-xs">
                      {row.appointment_date
                        ? new Date(row.appointment_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-red-600">
                      {row.debt_amount} so&apos;m
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
