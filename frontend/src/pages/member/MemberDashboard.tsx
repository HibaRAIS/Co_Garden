import { useEffect, useState } from "react";
import {
  MapPin,
  CheckSquare,
  Leaf,
  Clock,
  Calendar,
  Sprout,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { plotService } from "../../services/plotService";
import { apiService } from "../../services/membreApi";
import { fetchTasks } from "../../services/tasks";

type Plot = {
  id: string;
  name: string;
  current_plant?: string;
  surface?: number;
  soil_type?: string;
  status?: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  plot?: {
    name: string;
  };
};

type MemberStats = {
  myPlots: number;
  activeTasks: number;
  completedTasks: number;
};

export function MemberDashboard() {
  const { profile, user } = useAuth();

  const [stats, setStats] = useState<MemberStats>({
    myPlots: 0,
    activeTasks: 0,
    completedTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activePlots, setActivePlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Récupérer les données du membre connecté
      const currentUser = await apiService.getCurrentUser();

      // Charger les données en parallèle
      const [plotsData, tasksData] = await Promise.all([
        plotService.getMemberPlots(), // Retourne toutes les parcelles avec infos de demande
        fetchTasks(),
      ]);

      // Filtrer uniquement les parcelles où le membre est occupant
      const memberPlots = Array.isArray(plotsData)
        ? plotsData.filter((plot: any) => plot.occupantid === currentUser.id)
        : [];

      // Filtrer les tâches assignées au membre (assigned_members contient des strings)
      const memberTasks = tasksData.filter(
        (task: any) =>
          task.assigned_members &&
          Array.isArray(task.assigned_members) &&
          task.assigned_members.includes(String(currentUser.id))
      );

      // Calculer les statistiques
      const activeTasks = memberTasks.filter(
        (t: any) => t.status === "to_do" || t.status === "in_progress"
      ).length;

      const completedTasks = memberTasks.filter(
        (t: any) => t.status === "done"
      ).length;

      setStats({
        myPlots: memberPlots.length,
        activeTasks,
        completedTasks,
      });

      // Convertir les parcelles au format attendu
      const formattedPlots = memberPlots.map((p: any) => ({
        id: p.id,
        name: p.name,
        current_plant: p.current_plant,
        surface: p.surface,
        soil_type: p.soil_type,
        status: p.status,
      }));

      // Prochaines tâches à faire (limité à 3)
      const upcoming = memberTasks
        .filter((t: any) => t.status !== "done")
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || "",
          due_date: t.due_date || new Date().toISOString(),
          status:
            t.status === "to_do"
              ? "pending"
              : t.status === "in_progress"
              ? "in_progress"
              : "completed",
          plot: t.plot_id ? { name: `Parcelle ${t.plot_id}` } : undefined,
        }))
        .sort(
          (a: any, b: any) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        )
        .slice(0, 3);

      setActivePlots(formattedPlots.slice(0, 3));
      setRecentTasks(upcoming);
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fonction pour les couleurs de statut des tâches (inchangée)
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default: // 'pending' ou autre
        return "bg-orange-100 text-orange-800";
    }
  };

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
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#81C784] rounded-2xl p-8 text-white">
        <h1 className="text-3xl text-white mb-2">
          Bonjour {profile?.first_name || "Jardinier"} 🌞
        </h1>
        <p className="text-white/90">
          Voici l'état de votre jardin aujourd'hui
        </p>
      </div>

      {/* Statistiques Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin size={24} className="text-[#4CAF50]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.myPlots}
              </p>
              <p className="text-sm text-gray-600">Mes parcelles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeTasks}
              </p>
              <p className="text-sm text-gray-600">Tâches actives</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] hover:shadow-lg transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckSquare size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.completedTasks}
              </p>
              <p className="text-sm text-gray-600">Tâches complétées</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tâches Prioritaires */}
        <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-[#4CAF50]" />
              <h2 className="text-xl text-gray-900">Mes tâches prioritaires</h2>
            </div>
            <Link
              to="/member/tasks"
              className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
            >
              <span className="text-sm">Voir tout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#4CAF50] hover:shadow-md transition-all group"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CheckSquare size={20} className="text-blue-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {task.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getTaskStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status === "completed"
                          ? "Complétée"
                          : task.status === "in_progress"
                          ? "En cours"
                          : "En attente"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(task.due_date).toLocaleDateString("fr-FR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {task.plot && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {task.plot.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckSquare size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Aucune tâche à faire</p>
              <p className="text-sm text-gray-400">
                Vous êtes complètement à jour!
              </p>
            </div>
          )}
        </div>

        {/* Parcelles Actives */}
        <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-[#4CAF50]" />
              <h2 className="text-xl text-gray-900">Mes parcelles actives</h2>
            </div>
            <Link
              to="/member/plots"
              className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
            >
              <span className="text-sm">Voir tout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {activePlots.length > 0 ? (
            <div className="space-y-3">
              {activePlots.map((plot) => (
                <div
                  key={plot.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#4CAF50] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-[#4CAF50]/20 flex items-center justify-center">
                        <Leaf className="text-[#4CAF50]" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {plot.name}
                        </h3>
                        {plot.current_plant && (
                          <p className="text-xs text-gray-600">
                            Culture: {plot.current_plant}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="inline-block px-2 py-1 bg-[#4CAF50]/10 text-[#4CAF50] rounded-lg text-xs font-medium">
                      Occupée
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    {plot.surface && <p>📐 Surface: {plot.surface} m²</p>}
                    {plot.soil_type && <p>🌍 Sol: {plot.soil_type}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                Aucune parcelle assignée
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
