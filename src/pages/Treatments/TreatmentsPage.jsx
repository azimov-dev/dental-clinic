import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import { apiClient } from "../../api/client";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function TreatmentsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [treatments, setTreatments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchTreatments() {
      try {
        setError("");
        setLoading(true);
        const data = await apiClient("/appointments?status=completed", {
          method: "GET",
          token,
        });
        setTreatments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load treatments");
      } finally {
        setLoading(false);
      }
    }

    fetchTreatments();
  }, [token]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {t("treatments")}
          </h1>
          <p className="text-xs text-slate-500">
            Yakunlangan qabul va davolashlar roʻyxati.
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-1 text-xs text-slate-600">
          {treatments.length} record
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
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">{t("patients")}</th>
              <th className="px-3 py-2">{t("services")}</th>
              <th className="px-3 py-2">Doctor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-xs">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : treatments.length > 0 ? (
              treatments.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 text-xs">
                    {row.date ||
                      row.completedAt?.slice(0, 10) ||
                      row.appointment_date?.slice(0, 10) ||
                      "-"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.patientName ||
                      row.patient?.name ||
                      row.patient_name ||
                      "-"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.serviceName ||
                      row.treatmentName ||
                      row.service?.name ||
                      "-"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.doctorName || row.doctor?.name || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-xs text-slate-400"
                >
                  No completed treatments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
