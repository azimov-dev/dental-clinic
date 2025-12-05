// src/components/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";
import { useAuth } from "../../features/auth/useAuth";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import {
  Activity,
  Package,
  SquareBottomDashedScissorsIcon,
  User,
  Users,
} from "lucide-react";

function formatDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export function AdminDashboard() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [patientsCount, setPatientsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [appointmentsDoneToday, setAppointmentsDoneToday] = useState(0);
  const [latestAppointments, setLatestAppointments] = useState([]);

  useEffect(() => {
    if (!token) return;

    const today = new Date().toISOString().slice(0, 10);

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [patientsRes, servicesRes, appointmentsRes] = await Promise.all([
          apiClient("/patients", { method: "GET", token }),
          apiClient("/services", { method: "GET", token }),
          apiClient(`/appointments?date=${today}`, { method: "GET", token }),
        ]);

        const patients = Array.isArray(patientsRes) ? patientsRes : [];
        const services = Array.isArray(servicesRes) ? servicesRes : [];
        const appointments = Array.isArray(appointmentsRes)
          ? appointmentsRes
          : [];

        setPatientsCount(patients.length);
        setServicesCount(services.length);

        setAppointmentsToday(appointments.length);
        setAppointmentsDoneToday(
          appointments.filter(
            (a) =>
              (a.status || "").toLowerCase() === "done" ||
              (a.status || "").toLowerCase() === "completed",
          ).length,
        );

        // sort by time/date desc, keep last 6
        const sorted = [...appointments].sort((a, b) => {
          const da = new Date(a.appointment_date || a.date || 0).getTime();
          const db = new Date(b.appointment_date || b.date || 0).getTime();
          return db - da;
        });

        setLatestAppointments(sorted.slice(0, 6));
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const completedRatio =
    appointmentsToday > 0
      ? Math.round((appointmentsDoneToday / appointmentsToday) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs text-slate-500">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full bg-slate-50 px-3 py-1">
            <Users width={"16px"} className="inline-block" /> {patientsCount}{" "}
            {t("patients.title").toLowerCase()}
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1">
            <Package width={"16px"} className="inline-block" /> {servicesCount}{" "}
            {t("services").toLowerCase()}
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1">
            <Activity width={"16px"} className="inline-block" />{" "}
            {appointmentsToday} {t("appointments.title").toLowerCase()}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Cards row */}
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label={t("patients.title")}
          value={patientsCount}
          hint={t("dashboard.patientsHint")}
          icon={<Users width={"16px"} className="inline-block" />}
        />
        <StatCard
          label={t("services")}
          value={servicesCount}
          hint={t("dashboard.servicesHint")}
          icon={<Package width={"16px"} className="inline-block" />}
        />
        <StatCard
          label={t("appointments.title")}
          value={appointmentsToday}
          hint={t("dashboard.appointmentsHint")}
          icon={<Activity width={"16px"} className="inline-block" />}
        />
        <ProgressCard
          label={t("treatments")}
          done={appointmentsDoneToday}
          total={appointmentsToday}
          hint={t("dashboard.treatmentsHint")}
        />
      </div>

      {/* bottom: mini charts + latest appointments */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr,1.8fr]">
        {/* mini chart-style cards */}
        <div className="space-y-3">
          <MiniChartCard
            title={t("dashboard.todayOccupancy")}
            percent={appointmentsToday >= 10 ? 100 : appointmentsToday * 10}
            description={t("dashboard.todayOccupancyDesc")}
          />
          <MiniChartCard
            title={t("dashboard.completedTreatments")}
            percent={completedRatio}
            description={t("dashboard.completedTreatmentsDesc")}
          />
        </div>

        {/* latest appointments table */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {t("todaysAppointments")}
              </h2>
              <p className="text-[11px] text-slate-500">
                {t("dashboard.latestPatients")}
              </p>
            </div>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
              {appointmentsToday} {t("appointments.title").toLowerCase()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">{t("dashboard.date")}</th>
                  <th className="px-3 py-2">{t("patients.title")}</th>
                  <th className="px-3 py-2">{t("services")}</th>
                  <th className="px-3 py-2">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-xs text-slate-500"
                    >
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : latestAppointments.length > 0 ? (
                  latestAppointments.map((a) => (
                    <tr key={a.id}>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {formatDate(a.appointment_date || a.date)}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {a.patient_name ||
                          a.patientName ||
                          a.patient?.name ||
                          "-"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {a.service_name ||
                          a.serviceName ||
                          a.service?.name ||
                          "-"}
                      </td>
                      <td className="px-3 py-2 text-[11px] capitalize">
                        <StatusPill value={a.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-xs text-slate-400"
                    >
                      {t("noAppointments")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* small presentational components */

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-lg">
          <span className="text-sky-500">{icon}</span>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">{hint}</p>
    </div>
  );
}

function ProgressCard({ label, done, total, hint }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {done} / {total}
          </p>
        </div>
        <span className="text-xs font-semibold text-sky-500">{percent}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-sky-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] text-slate-400">{hint}</p>
    </div>
  );
}

function MiniChartCard({ title, percent, description }) {
  const safePercent = Math.max(0, Math.min(100, percent || 0));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[11px] font-semibold text-slate-700">{title}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-16 flex-1 rounded-lg bg-slate-50 p-1">
          <div className="flex h-full items-end gap-[2px]">
            {Array.from({ length: 8 }).map((_, i) => {
              const barHeight =
                safePercent === 0
                  ? 10
                  : 10 + (safePercent / 100) * 40 * ((i + 2) / 8);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-[4px] bg-sky-400/70"
                  style={{ height: `${barHeight}px` }}
                />
              );
            })}
          </div>
        </div>
        <span className="text-xs font-semibold text-sky-600">
          {safePercent}%
        </span>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">{description}</p>
    </div>
  );
}

function StatusPill({ value }) {
  const v = (value || "").toLowerCase();
  let text = v || "scheduled";
  let classes =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border";

  if (v === "done" || v === "completed") {
    classes += " border-emerald-100 bg-emerald-50 text-emerald-700";
    text = "done";
  } else if (v === "cancelled" || v === "canceled") {
    classes += " border-rose-100 bg-rose-50 text-rose-700";
  } else {
    classes += " border-sky-100 bg-sky-50 text-sky-700";
  }

  return <span className={classes}>{text}</span>;
}
