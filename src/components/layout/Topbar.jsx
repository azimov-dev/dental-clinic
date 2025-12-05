import { useAuth } from "../../features/auth/useAuth";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function Topbar() {
  const { user, role } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const panelTitle =
    role === "admin"
      ? t("adminPanel")
      : role === "doctor"
      ? t("doctorPanel")
      : role === "reception"
      ? t("receptionPanel")
      : t("dashboard");

  const initials = (user?.full_name || user?.name || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wide text-slate-400">
          {t("dashboard.title")}
        </span>
        <span className="text-sm font-semibold text-slate-800">
          {panelTitle}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* language switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-1 py-0.5 text-[10px]">
          {["uz", "ru", "en"].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={[
                "rounded-lg px-2 py-0.5 font-semibold",
                lang === code
                  ? "bg-sky-500 text-white"
                  : "text-slate-500 hover:bg-slate-100",
              ].join(" ")}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        {/* user card */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800">
              {user?.full_name || user?.name || "Foydalanuvchi"}
            </span>
            <span className="text-[10px] text-slate-400 uppercase">
              {role || "unknown"}
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
