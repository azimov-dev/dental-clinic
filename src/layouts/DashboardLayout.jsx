import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logoutUser } from "../features/auth/authSlice.jsx";
import { useAuth } from "../features/auth/useAuth";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import AiChat from "../components/ai/aiChat.jsx";

export default function DashboardLayout() {
  const { role } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const base =
    role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/reception";

  return (
    <div className="flex min-h-screen bg-slate-100 text-[13px]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col bg-slate-900 text-slate-100 md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500 text-white shadow">
            🦷
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">
              Dental<span className="text-sky-400">Soft</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {role?.toUpperCase() || "USER"}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-xs">
          <SectionLabel>{t("common.home")}</SectionLabel>
          <SidebarLink to={base}>{t("dashboard.title")}</SidebarLink>
          <SidebarLink to={`${base}/appointments`}>
            {t("appointments.title")}
          </SidebarLink>
          <SidebarLink to={`${base}/patients`}>
            {t("patients.title")}
          </SidebarLink>

          {role === "admin" && (
            <>
              <SectionLabel>{t("common.clinic")}</SectionLabel>
              <SidebarLink to={`${base}/services`}>{t("services")}</SidebarLink>
              <SidebarLink to={`${base}/categories`}>
                {t("categories")}
              </SidebarLink>
              <SidebarLink to={`${base}/treatments`}>
                {t("treatments")}
              </SidebarLink>
              <SidebarLink to={`${base}/debts`}>{t("debts")}</SidebarLink>

              <SectionLabel>{t("common.reports")}</SectionLabel>
              <SidebarLink to={`${base}/reports/daily`}>
                {t("dailyReports")}
              </SidebarLink>

              <SectionLabel>{t("common.warehouse")}</SectionLabel>
              <SidebarLink to={`${base}/warehouse`}>
                {t("warehouse")}
              </SidebarLink>

              <SectionLabel>{t("common.users")}</SectionLabel>
              <SidebarLink to={`${base}/users`}>{t("users")}</SidebarLink>
            </>
          )}

          {role === "doctor" && (
            <>
              <SectionLabel>{t("common.doctor")}</SectionLabel>
              <SidebarLink to={`${base}/treatments`}>
                {t("treatments")}
              </SidebarLink>
              <SidebarLink to={`${base}/debts`}>{t("debts")}</SidebarLink>
            </>
          )}

          {role === "reception" && (
            <>
              <SectionLabel>{t("common.reception")}</SectionLabel>
              <SidebarLink to={`${base}/appointments`}>
                {t("appointments.title")}
              </SidebarLink>
              <SidebarLink to={`${base}/patients`}>
                {t("patients.title")}
              </SidebarLink>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 px-4 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
          >
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>

      <AiChat />
    </div>
  );
}

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
          isActive
            ? "bg-slate-800 text-sky-300"
            : "text-slate-300 hover:bg-slate-800 hover:text-white",
        ].join(" ")
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
      <span>{children}</span>
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mt-3 mb-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </div>
  );
}
