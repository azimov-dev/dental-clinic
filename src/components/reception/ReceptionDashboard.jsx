import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { useAuth } from "../../features/auth/useAuth";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

export function ReceptionDashboard() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    if (!token) return;
    const today = new Date().toISOString().slice(0, 10);

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [appointmentsRes, patientsRes] = await Promise.all([
          apiClient(`/appointments?date=${today}`, { method: "GET", token }),
          apiClient("/patients", { method: "GET", token }),
        ]);

        const appointments = Array.isArray(appointmentsRes)
          ? appointmentsRes
          : [];

        setTodayAppointments(appointments.slice(0, 8));
        setTotalPatients(Array.isArray(patientsRes) ? patientsRes.length : 0);
      } catch (err) {
        setError(err.message || "Failed to load reception dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {t("receptionPanel")}
          </h1>
          <p className="text-xs text-slate-500">
            Bugungi qabul va ro‘yxatga olingan bemorlar bo‘yicha ma’lumot.
          </p>
        </div>
        <div className="flex gap-2 text-[11px] text-slate-600">
          <span className="rounded-full bg-slate-50 px-3 py-1">
            {todayAppointments.length} {t("appointments.title").toLowerCase()}
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1">
            {totalPatients} {t("patients.title").toLowerCase()}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* 2 cards: upcoming + quick stats */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Yaqin qabul</h2>
          <p className="mb-2 text-[11px] text-slate-500">
            Eng yaqin navbatdagi 5 ta qabul.
          </p>
          <div className="space-y-2 text-xs">
            {loading ? (
              <div className="text-slate-500">Yuklanmoqda...</div>
            ) : todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">
                      {a.patient_name ||
                        a.patientName ||
                        a.patient?.name ||
                        "-"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {a.service_name ||
                        a.serviceName ||
                        a.service?.name ||
                        "-"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-800">
                      {formatTime(a.time || a.startTime)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(a.status || "scheduled").toLowerCase()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-slate-400">
                {t("noAppointments")}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Tezkor statistika
          </h2>
          <p className="mb-3 text-[11px] text-slate-500">
            Bu maʼlumotlar ro‘yxat va navbatni boshqarishda yordam beradi.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">Bugungi qabul soni</span>
              <span className="font-semibold text-slate-900">
                {todayAppointments.length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-600">
                Barcha ro‘yxatdagi bemorlar
              </span>
              <span className="font-semibold text-slate-900">
                {totalPatients}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
