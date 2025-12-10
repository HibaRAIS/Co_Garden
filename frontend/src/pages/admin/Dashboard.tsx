import {
  MapPin,
  Users,
  CheckSquare,
  Leaf,
  Calendar as CalendarIcon,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { TaskCard } from "../../components/TaskCard";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { plotService } from "../../services/plotService";
import { apiService } from "../../services/membreApi";
import { fetchTasks } from "../../services/tasks";
import { plantsApi } from "../../services/plantsApi";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    occupiedPlots: 0,
    totalMembers: 0,
    pendingTasks: 0,
    trackedPlants: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Charger les données en parallèle
        const [plotsData, membersData, tasksData, plantsData] =
          await Promise.all([
            plotService.getAll(),
            apiService.getAllMembers(),
            fetchTasks(),
            plantsApi.getAll(0, 100),
          ]);

        // Calculer les statistiques
        const occupiedPlots = plotsData.filter(
          (p: any) => p.status === "occupied"
        ).length;
        const pendingTasks = tasksData.filter(
          (t: any) => t.status === "to_do" || t.status === "in_progress"
        ).length;
        const trackedPlants = plotsData.filter(
          (p: any) => p.current_plant
        ).length;

        // Compter les membres actifs (sans l'admin)
        const activeMembers =
          membersData.members?.filter((m: any) => m.role !== "admin").length ||
          (membersData.total > 0 ? membersData.total - 1 : 0);

        setStats({
          occupiedPlots,
          totalMembers: activeMembers,
          pendingTasks,
          trackedPlants,
        });

        // Prochaines tâches (convertir le format de l'API au format UI)
        const upcoming = tasksData
          .filter((t: any) => t.status !== "done")
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            date: t.due_date || new Date().toISOString(),
            status:
              t.status === "to_do"
                ? "pending"
                : t.status === "in_progress"
                ? "in-progress"
                : "completed",
            assignee: "Équipe",
          }))
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          .slice(0, 3);

        setUpcomingTasks(upcoming);
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#81C784] rounded-2xl p-8 text-white">
        <h1 className="text-3xl text-white mb-2">
          Bonjour {user?.first_name || "Admin"} 🌞
        </h1>
        <p className="text-white/90">Bienvenue dans votre jardin partagé</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Parcelles occupées"
          value={stats.occupiedPlots}
          icon={MapPin}
          bgColor="bg-green-100"
          iconColor="text-[#4CAF50]"
        />
        <StatCard
          title="Membres actifs"
          value={stats.totalMembers}
          icon={Users}
          bgColor="bg-blue-100"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Tâches à venir"
          value={stats.pendingTasks}
          icon={CheckSquare}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Plantes suivies"
          value={stats.trackedPlants}
          icon={Leaf}
          bgColor="bg-purple-100"
          iconColor="text-purple-500"
        />
      </div>

      {/* Upcoming Tasks Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-[#4CAF50]" />
            <h2 className="text-xl text-gray-900">Prochaines tâches</h2>
          </div>
          <Link
            to="/admin/tasks"
            className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
          >
            <span className="text-sm">Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {upcomingTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune tâche à venir</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/plots"
          className="bg-white rounded-xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 mb-1">Gérer les parcelles</h3>
              <p className="text-xs text-gray-600">Voir toutes les parcelles</p>
            </div>
            <MapPin className="h-8 w-8 text-[#4CAF50] group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/gallery"
          className="bg-white rounded-xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 mb-1">Catalogue plantes</h3>
              <p className="text-xs text-gray-600">Découvrir les plantes</p>
            </div>
            <Leaf className="h-8 w-8 text-[#4CAF50] group-hover:scale-110 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
