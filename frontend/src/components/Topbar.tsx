import { LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Topbar() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  const getRoleText = () => {
    if (!user) return "";
    return user.role === "admin" ? "Administrateur" : "Membre";
  };

  return (
    <div className="h-16 bg-white border-b border-[#E0E0E0] flex items-center justify-between px-6 lg:px-8">
      {/* Titre ou espace vide à gauche */}
      <div className="flex-1">
        {/* Vous pouvez ajouter un titre ici si besoin, ou laisser vide */}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-gray-900 font-medium">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{getRoleText()}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#81C784] flex items-center justify-center">
            <span className="text-white font-semibold">
              {getUserInitials()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
