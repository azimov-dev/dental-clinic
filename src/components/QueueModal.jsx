import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { apiClient } from "../api/client.js";

export function QueueModal({ onClose }) {
  const [queue, setQueue] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadQueue = async () => {
    if (!token) {
      setError("No token found. Please login as doctor or admin.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiClient(
        `/appointments/queue?date=${selectedDate}&status=pending`,
        { token },
      );

      const mapped = data.map((appt) => {
        const dt = new Date(appt.appointment_date);
        const time = dt.toTimeString().slice(0, 5);

        const patientName = appt.patient
          ? `${appt.patient.first_name} ${appt.patient.last_name}`
          : "Unknown patient";

        return {
          id: appt.id,
          name: patientName,
          reason: "Dental treatment", // backend doesn't send reason; you can change later
          time,
        };
      });

      setQueue(mapped);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Failed to load queue. Make sure you are logged in as doctor/admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const completeAppointment = async (id) => {
    if (!token) return;

    try {
      await apiClient(`/appointments/${id}/status`, {
        method: "PATCH",
        token,
        body: { status: "completed" },
      });

      setQueue((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update appointment status");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end pointer-events-none">
      <div className="pointer-events-auto m-4 w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Today&apos;s Queue
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Patients waiting for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Date selector */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2">
          <span className="text-xs text-gray-600">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 text-xs text-red-600 bg-red-50">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="max-h-80 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="py-4 text-center text-sm text-gray-500">
              Loading queue...
            </div>
          ) : queue.length === 0 ? (
            <div className="py-4 text-center text-sm text-gray-500">
              No patients in queue
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {patient.reason}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      Time: {patient.time}
                    </div>
                  </div>
                  <button
                    onClick={() => completeAppointment(patient.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Done
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-xl border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="text-center text-sm text-gray-600">
            {queue.length} patient{queue.length !== 1 ? "s" : ""} waiting
          </div>
        </div>
      </div>
    </div>
  );
}
