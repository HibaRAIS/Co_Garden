import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Dashboard as AdminDashboard } from "./pages/admin/Dashboard";
import { Plots as AdminPlots } from "./pages/admin/Plots";
import { Tasks as AdminTasks } from "./pages/admin/Tasks";
import { Calendar as AdminCalendar } from "./pages/admin/Calendar";
import { Gallery as AdminGallery } from "./pages/admin/Gallery";
import { Members } from "./pages/admin/Members";
import { MemberDashboard } from "./pages/member/MemberDashboard";
import { Profile } from "./pages/member/Profile";
import { Gallery } from "./pages/member/Gallery";
import { MemberPlots } from "./pages/member/MemberPlots";
import { MemberTasks } from "./pages/member/MemberTasks";
import { MemberCalendar } from "./pages/member/MemberCalendar";

import { Layout } from "./components/Layout";
import { MemberLayout } from "./components/MemberLayout";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes Admin - avec Layout admin */}
          <Route element={<Layout />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/plots"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Members />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Routes Membre - avec Layout membre */}
          <Route element={<MemberLayout />}>
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/calendar"
              element={
                <ProtectedRoute>
                  <MemberCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/gallery"
              element={
                <ProtectedRoute>
                  <Gallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/tasks"
              element={
                <ProtectedRoute>
                  <MemberTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/plots"
              element={
                <ProtectedRoute>
                  <MemberPlots />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
