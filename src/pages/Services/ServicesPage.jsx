import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">{t("services")}</h1>
      <p className="text-xs text-slate-500">
        Admin xizmat turlarini, narxlarni va har bir doktor bajara oladigan
        xizmatlarni boshqaradi. To‘liq boshqaruv uchun yuqori menyudagi{" "}
        <span className="font-medium text-sky-600">Xizmatlar</span> bo‘limidan
        foydalaning.
      </p>
    </div>
  );
}
