import { Outlet } from "react-router-dom";
import { MemberSidebar } from "./MemberSidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function MemberLayout() {
  const { user } = useAuth();

  // Rediriger si l'utilisateur est admin
  if (user && user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <MemberSidebar />
      <div className="lg:ml-64">
        <Topbar />
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
