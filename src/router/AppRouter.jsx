import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

import { AdminDashboard } from "../components/admin/AdminDashboard.jsx";
import { DoctorDashboard } from "../components/doctor/DoctorDashboard.jsx";
import { ReceptionDashboard } from "../components/reception/ReceptionDashboard.jsx";

import { Services } from "../components/admin/Services.jsx";
import { Users } from "../components/admin/Users.jsx";
import { Treatments as DoctorTreatments } from "../components/doctor/Treatments.jsx";
import { Patients as ReceptionPatients } from "../components/reception/Patients.jsx";
import { Appointments as ReceptionAppointments } from "../components/reception/Appointments.jsx";

import CategoriesPage from "../pages/Admin/CategoriesPage.jsx";
import DebtsPage from "../pages/Admin/DebtsPage.jsx";
import DailyReportsPage from "../pages/Admin/DailyReportsPage.jsx";
import WarehousePage from "../pages/Admin/WarehousePage.jsx";

import { useAuth } from "../features/auth/useAuth";
import { QueueModal } from "../components/QueueModal";

function RoleRedirect() {
  const { role } = useAuth();

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "doctor") return <Navigate to="/doctor" replace />;
  if (role === "reception") return <Navigate to="/reception" replace />;

  return <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected area */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* / -> redirect by role */}
          <Route index element={<RoleRedirect />} />

          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="/admin/services" element={<Services />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/treatments" element={<DoctorTreatments />} />
            <Route path="/admin/debts" element={<DebtsPage />} />
            <Route path="/admin/reports/daily" element={<DailyReportsPage />} />
            <Route path="/admin/warehouse" element={<WarehousePage />} />

            <Route path="/admin/patients" element={<ReceptionPatients />} />
            <Route
              path="/admin/appointments"
              element={<ReceptionAppointments />}
            />
            <Route path="/admin/users" element={<Users />} />
          </Route>

          {/* Doctor */}
          <Route element={<RoleRoute allowedRoles={["doctor"]} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/treatments" element={<DoctorTreatments />} />
            <Route path="/doctor/debts" element={<DebtsPage />} />
            <Route path="/doctor/queue" element={<QueueModal />} />
            <Route
              path="/doctor/appointments"
              element={<ReceptionAppointments />}
            />
            <Route path="/doctor/patients" element={<ReceptionPatients />} />
          </Route>

          {/* Reception */}
          <Route element={<RoleRoute allowedRoles={["reception"]} />}>
            <Route path="/reception" element={<ReceptionDashboard />} />
            <Route
              path="/reception/appointments"
              element={<ReceptionAppointments />}
            />
            <Route path="/reception/patients" element={<ReceptionPatients />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
