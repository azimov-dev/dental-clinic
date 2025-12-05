import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import { apiClient } from "../../api/client";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export default function PatientsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function fetchPatients() {
      try {
        setError("");
        setLoading(true);
        const data = await apiClient("/patients", {
          method: "GET",
          token,
        });
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load patients");
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, [token]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) return;

    const payload = {
      first_name: firstName,
      last_name: lastName,
      phone,
      birth_date: birthDate || null,
      address,
    };

    try {
      setError("");
      setSaving(true);

      const created = await apiClient("/patients", {
        method: "POST",
        token,
        body: payload,
      });

      setPatients((prev) => [...prev, created]);

      setFirstName("");
      setLastName("");
      setPhone("");
      setBirthDate("");
      setAddress("");
    } catch (err) {
      setError(err.message || "Failed to add patient");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1.2fr]">
      {/* list */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {t("patients.title")}
            </h1>
            <p className="text-xs text-slate-500">
              Barcha ro‘yxatga olingan bemorlar.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {patients.length} {t("patients.title").toLowerCase()}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Ism</th>
                <th className="px-3 py-2">Telefon</th>
                <th className="px-3 py-2">Tug‘ilgan sana</th>
                <th className="px-3 py-2">Manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-xs">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-xs">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-3 py-2 text-xs">{p.phone}</td>
                    <td className="px-3 py-2 text-xs">{p.birth_date || "-"}</td>
                    <td className="px-3 py-2 text-xs">{p.address || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-xs text-slate-400"
                  >
                    {t("noPatients")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* form */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          {t("addPatient")}
        </h2>

        <form className="mt-3 space-y-3" onSubmit={handleAddPatient}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                First name
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Last name
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Telefon
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Tug‘ilgan sana
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                           focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600">
              Manzil
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none
                         focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white shadow-sm
                       hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {saving ? "Saqlanmoqda..." : t("save")}
          </button>
        </form>
      </div>
    </div>
  );
}
