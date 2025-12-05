import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { apiClient } from "../../api/client.js";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

export function Patients() {
  const { t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    address: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient("/patients", { token });
      const normalized = data.map((p) => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        phone: p.phone,
        birthDate: p.birth_date,
        address: p.address,
      }));
      setPatients(normalized);
    } catch (err) {
      console.error(err);
      setError(err.message || t("errors.loadPatients"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError(t("errors.noToken"));
      return;
    }
    fetchPatients();
  }, [token]);

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName} ${patient.phone}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const body = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        birth_date: formData.birthDate,
        address: formData.address,
      };
      await apiClient("/patients", { method: "POST", token, body });
      setShowAddModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        birthDate: "",
        address: "",
      });
      await fetchPatients();
    } catch (err) {
      console.error(err);
      setError(err.message || t("errors.addPatient"));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("patients.title")}
          </h2>
          <p className="text-gray-600 text-sm mt-1">{t("patients.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t("patients.addButton")}
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("patients.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  {t("patients.table.fullName")}
                </th>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  {t("patients.table.phone")}
                </th>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  {t("patients.table.birthDate")}
                </th>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  {t("patients.table.address")}
                </th>
                <th className="px-6 py-3 text-right text-gray-600 text-sm">
                  {t("patients.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm">
                    {t("patients.noPatients")}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {patient.birthDate}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {patient.address}
                    </td>
                    <td className="px-6 py-3 text-sm text-right">
                      <button
                        onClick={() => handleEdit(patient.id)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900 text-lg font-medium">
                {t("patients.addPatient")}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t("patients.form.firstName")}
                  </label>
                  <input
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t("patients.form.lastName")}
                  </label>
                  <input
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t("patients.form.phone")}
                  </label>
                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t("patients.form.birthDate")}
                  </label>
                  <input
                    type="date"
                    required
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t("patients.form.address")}
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
