import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function Layout() {
  const { user } = useAuth();

  // Rediriger si l'utilisateur n'est pas admin
  if (user && user.role !== "admin") {
    return <Navigate to="/member/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="lg:ml-64">
        <Topbar />
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
