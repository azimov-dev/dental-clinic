import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../features/auth/authSlice.jsx";
import { useAuth } from "../features/auth/useAuth";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useAuth();

  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!phone || !password) {
      setLocalError("Telefon raqam va parol kiriting");
      return;
    }

    try {
      const data = await dispatch(loginUser({ phone, password })).unwrap();

      const user = data.user || data.data || {};
      const role = user.role || user.user_role || user.position || "reception";

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "doctor") {
        navigate("/doctor", { replace: true });
      } else if (role === "reception") {
        navigate("/reception", { replace: true });
      } else {
        // fallback
        navigate("/", { replace: true });
      }
    } catch (err) {
      setLocalError(
        typeof err === "string"
          ? err
          : "Kirishda xatolik. Maʼlumotlarni tekshiring.",
      );
    }
  };

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          Telefon raqam
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none
                     focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-600">
          Parol
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none
                     focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      {(localError || error) && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {localError || error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-lg bg-sky-500 px-3 py-2
                   text-sm font-semibold text-white shadow-sm
                   hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
      >
        {isLoading ? "Kirilmoqda..." : "Kirish"}
      </button>

      <p className="text-[11px] text-center text-slate-400">
        Admin: tizimni boshqarish • Doktor: davolashlar • Registrator: qabul va
        navbat
      </p>
    </form>
  );
}
