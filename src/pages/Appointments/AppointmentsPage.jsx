import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import { apiClient } from "../../api/client";
import { QueueModal } from "../../components/QueueModal.jsx";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function AppointmentsPage() {
  const { token, role } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    if (!token) return;

    const today = new Date().toISOString().slice(0, 10);

    async function fetchAppointments() {
      try {
        setLoading(true);
        setError("");
        const data = await apiClient(`/appointments?date=${today}`, {
          method: "GET",
          token,
        });
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [token]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {t("appointments.title")}
          </h1>
          <p className="text-xs text-slate-500">{t("todaysAppointments")}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {appointments.length}{" "}
            {appointments.length === 1 ? "appointment" : "appointments"}
          </div>

          {role === "doctor" && (
            <button
              type="button"
              onClick={() => setShowQueue((prev) => !prev)}
              className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-600"
            >
              {showQueue ? "Hide queue" : "Show queue"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">{t("common.time")}</th>
              <th className="px-4 py-2">{t("patients.title")}</th>
              <th className="px-4 py-2">{t("services")}</th>
              <th className="px-4 py-2">{t("common.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-xs">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : appointments.length > 0 ? (
              appointments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 text-xs text-slate-700">
                    {a.time || a.startTime || "-"}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {a.patientName || a.patient?.name || a.patient_name || "-"}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {a.serviceName || a.service?.name || a.service_name || "-"}
                  </td>
                  <td className="px-4 py-2 text-xs capitalize">
                    {a.status || "scheduled"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-xs text-slate-400"
                >
                  {t("noAppointments")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {role === "doctor" && showQueue && (
        <QueueModal onClose={() => setShowQueue(false)} />
      )}
    </div>
  );
}
