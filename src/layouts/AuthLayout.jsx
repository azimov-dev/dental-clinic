// src/layouts/AuthLayout.jsx
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-100">
      {/* Left: form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white text-xl font-bold">
              🦷
            </div>
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              Dental Clinic CRM
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Bitta paneldan qabul, bemor va hisobotlarni boshqaring.
            </p>
          </div>

          <Outlet />
        </div>
      </div>

      {/* Right: side info */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-slate-900 text-slate-100">
        <div>
          <h2 className="text-2xl font-semibold">
            Har bir tabassumni hisobga oling
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Admin raqamlarni kuzatadi, doktor tishni tekshiradi, registrator esa
            navbatni boshqaradi.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} DentalSoft
        </div>
      </div>
    </div>
  );
}
