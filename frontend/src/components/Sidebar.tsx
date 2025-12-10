import { Link, useLocation } from "react-router-dom";
import {
  Home,
  MapPin,
  CheckSquare,
  Calendar,
  Leaf,
  Image,
  User,
  Menu,
  X,
  Users,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Membres", href: "/admin/members", icon: Users },
  { name: "Parcelles", href: "/admin/plots", icon: MapPin },
  { name: "Tâches", href: "/admin/tasks", icon: CheckSquare },
  { name: "Calendrier", href: "/admin/calendar", icon: Calendar },
  { name: "Galerie", href: "/admin/gallery", icon: Leaf },
];

export function Sidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Le useAuth hook gère généralement la redirection après déconnexion
    // Si besoin d'une action supplémentaire ici, ajoutez-la.
  };
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-[#4CAF50] text-white"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-[#E0E0E0] z-40
          transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[#E0E0E0]">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#81C784] flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl text-[#2E7D32] block">Co-Garden</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive
                        ? "bg-[#4CAF50] text-white shadow-lg shadow-green-500/30"
                        : "text-gray-600 hover:bg-[#F8F5F0] hover:text-[#2E7D32]"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#E0E0E0]">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2 rounded-xl justify-center w-full"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
