import { useEffect, useState } from "react";
import { Plus, Calendar, X } from "lucide-react";
import { apiClient } from "../../api/client.js";

export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [formData, setFormData] = useState({
    patientId: "",
    date: new Date().toISOString().slice(0, 10),
    time: "",
    selectedServices: [], // array of service ids
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ---- Helpers ----

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const data = await apiClient("/patients", { token });
      const normalized = data.map((p) => ({
        id: p.id,
        fullName: `${p.first_name} ${p.last_name}`,
      }));
      setPatients(normalized);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load patients");
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const data = await apiClient("/services?active=true", { token });
      const normalized = data.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
      }));
      setServices(normalized);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiClient(`/appointments?date=${selectedDate}`, {
        token,
      });

      const normalized = data.map((a) => {
        const dt = new Date(a.appointment_date);
        const date = dt.toISOString().slice(0, 10);
        const time = dt.toTimeString().slice(0, 5);

        const patientName = a.patient
          ? `${a.patient.first_name} ${a.patient.last_name}`
          : "Unknown patient";

        // If backend later includes items/services, we can read them here.
        const servicesSummary = a.items ? `${a.items.length} service(s)` : "-";

        return {
          id: a.id,
          date,
          time,
          patient: patientName,
          servicesSummary,
          status: a.status || "pending",
        };
      });

      setAppointments(normalized);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // ---- Effects ----

  useEffect(() => {
    if (!token) {
      setError("No token found. Please login first.");
      return;
    }
    loadPatients();
    loadServices();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadAppointments();
  }, [token, selectedDate]);

  // ---- Form handlers ----

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleService = (serviceId) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.includes(serviceId);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((id) => id !== serviceId)
          : [...prev.selectedServices, serviceId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.patientId) {
      setError("Select a patient.");
      return;
    }
    if (!formData.date || !formData.time) {
      setError("Select date and time.");
      return;
    }
    if (!formData.selectedServices.length) {
      setError("Select at least one service.");
      return;
    }

    try {
      const appointmentDateIso = new Date(
        `${formData.date}T${formData.time}`,
      ).toISOString();

      const body = {
        patient_id: Number(formData.patientId),
        // doctor_id optional, we skip for now -> backend keeps null or you can add later
        appointment_date: appointmentDateIso,
        items: formData.selectedServices.map((id) => ({
          service_id: id,
          quantity: 1,
        })),
      };

      await apiClient("/appointments", {
        method: "POST",
        token,
        body,
      });

      setShowAddModal(false);
      setFormData({
        patientId: "",
        date: selectedDate,
        time: "",
        selectedServices: [],
      });

      await loadAppointments();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ---- JSX ----

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Appointments</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage today&apos;s appointments and schedule new ones
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setFormData((prev) => ({
              ...prev,
              date: selectedDate,
            }));
          }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      {/* Filters row (date picker) */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-lg bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Appointments table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-gray-600 text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    No appointments for this day
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-gray-100">
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {appt.time}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {appt.patient}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {appt.servicesSummary}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium " +
                          getStatusColor(appt.status)
                        }
                      >
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add appointment modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-900 text-lg">New Appointment</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Patient
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select patient</option>
                  {loadingPatients ? (
                    <option disabled>Loading patients...</option>
                  ) : (
                    patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Date + time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Services
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                  {loadingServices ? (
                    <div className="text-sm text-gray-500">
                      Loading services...
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No services found. Create them in the admin panel.
                    </div>
                  ) : (
                    services.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedServices.includes(s.id)}
                          onChange={() => toggleService(s.id)}
                          className="rounded border-gray-300"
                        />
                        <span>
                          {s.name}{" "}
                          {s.price != null && (
                            <span className="text-gray-500 text-xs">
                              (price: {s.price})
                            </span>
                          )}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
