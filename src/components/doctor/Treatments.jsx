import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiClient } from "../../api/client.js";

export function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (fromDate) params.append("from", fromDate);
    if (toDate) params.append("to", toDate);
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    const qs = params.toString();
    return qs ? `/treatments/my?${qs}` : "/treatments/my";
  };

  const loadTreatments = async () => {
    if (!token) {
      setError("No token found. Please login as doctor.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiClient(buildQuery(), { token });

      const mapped = data.map((t) => {
        const dt =
          t.treatment_date || t.created_at || t.createdAt || t.date || null;
        const date =
          dt && !Number.isNaN(new Date(dt).getTime())
            ? new Date(dt).toISOString().slice(0, 10)
            : "-";

        const patientName = t.patient
          ? `${t.patient.first_name} ${t.patient.last_name}`
          : "Unknown patient";

        const total = t.total_amount ?? t.totalAmount ?? 0;
        const paid = t.paid_amount ?? t.paidAmount ?? 0;
        const discount = t.discount_amount ?? t.discountAmount ?? 0;
        const debt =
          t.debt_amount ??
          t.debtAmount ??
          (total || 0) - (discount || 0) - (paid || 0);

        return {
          id: t.id,
          date,
          patient: patientName,
          status: t.status || "pending",
          total,
          paid,
          discount,
          debt,
          notes: t.notes || "",
        };
      });

      setTreatments(mapped);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Failed to load treatments. Make sure you are logged in as doctor.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreatments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const statusBadgeClass = (status) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const formatMoney = (n) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(n || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-gray-900">Treatments</h2>
          <p className="mt-1 text-sm text-gray-600">
            All treatments performed by you
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-7 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={loadTreatments}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Paid</th>
                <th className="px-4 py-2 text-right">Discount</th>
                <th className="px-4 py-2 text-right">Debt</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    Loading treatments...
                  </td>
                </tr>
              ) : treatments.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    No treatments found
                  </td>
                </tr>
              ) : (
                treatments.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-2 text-gray-800">{t.date}</td>
                    <td className="px-4 py-2 text-gray-900">{t.patient}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
                          statusBadgeClass(t.status)
                        }
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {formatMoney(t.total)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {formatMoney(t.paid)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {formatMoney(t.discount)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      {formatMoney(t.debt)}
                    </td>
                    <td className="px-4 py-2 text-gray-700 max-w-xs">
                      <span className="line-clamp-2">{t.notes}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
