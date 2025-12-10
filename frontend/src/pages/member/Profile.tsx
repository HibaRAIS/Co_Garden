import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Edit2,
  LogOut,
  MapPin,
  CheckSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useAuth } from "../../contexts/AuthContext";
import { apiService, Member } from "../../services/membreApi";
import { Link } from "react-router-dom";
import { plotService } from "../../services/plotService";
import { fetchTasks, ApiTask } from "../../services/tasks";
import { plantsApi, ApiComment } from "../../services/plantsApi";

interface UserPlot {
  id: number;
  name: string;
  status: string;
  current_plant?: string;
  surface?: number;
  soil_type?: string;
  occupantid?: number;
}

interface UserTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_members?: string[];
}

export function Profile() {
  const { user, logout } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<Member | null>(null);
  const [userPlots, setUserPlots] = useState<UserPlot[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [userComments, setUserComments] = useState<ApiComment[]>([]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  async function loadUserProfile() {
    try {
      setLoading(true);

      // Charger le profil utilisateur
      const profile = await apiService.getCurrentUser();
      setUserData(profile);

      // Charger les données en parallèle
      const [allPlots, allTasks, plantsResponse] = await Promise.all([
        profile.role === "admin"
          ? plotService.getAll()
          : plotService.getMemberPlots(),
        fetchTasks(),
        plantsApi.getAll(0, 100),
      ]);

      // Filtrer les parcelles assignées à cet utilisateur
      // getMemberPlots retourne toutes les parcelles, on filtre par occupantid
      const myPlots = allPlots.filter(
        (plot: any) => plot.occupantid === profile.id
      );
      setUserPlots(myPlots);

      // Filtrer les tâches assignées à cet utilisateur
      const myTasks = allTasks.filter((task: ApiTask) =>
        task.assigned_members?.includes(String(profile.id))
      );
      setUserTasks(myTasks);

      // Récupérer les détails de chaque plante pour avoir les commentaires
      const allComments: ApiComment[] = [];
      for (const plant of plantsResponse.data) {
        try {
          const plantDetails = await plantsApi.getById(plant.id);
          if (plantDetails.comments) {
            plantDetails.comments.forEach((comment) => {
              if (comment.user_id === String(profile.id)) {
                allComments.push({
                  ...comment,
                  plant_name: plantDetails.name,
                } as any);
              }
            });
          }
        } catch (error) {
          console.error(`Error loading comments for plant ${plant.id}:`, error);
        }
      }
      setUserComments(allComments.slice(0, 4)); // Limiter aux 4 derniers
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4CAF50] border-t-transparent"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">Erreur lors du chargement du profil</p>
        </div>
      </div>
    );
  }

  const displayName = `${userData.first_name} ${userData.last_name}`.trim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-30 h-30 bg-gradient-to-br from-[#4CAF50] to-[#81C784] rounded-2xl flex items-center justify-center flex-shrink-0">
            <User size={140} className="text-white" />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {displayName}
            </h2>
            <div className="flex items-center gap-2 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userData.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-[#4CAF50]/10 text-[#4CAF50]"
                }`}
              >
                {userData.role === "admin" ? "Administrateur" : "Membre"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
              >
                <Edit2 size={18} />
                Modifier mes infos
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl"
              >
                <LogOut size={18} />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Informations personnelles
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="text-[#4CAF50]" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Nom complet
                </p>
                <p className="text-gray-900 font-medium mt-1">{displayName}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Email
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {userData.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Téléphone
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {userData.phone || "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Date d'inscription
                </p>
                <p className="text-gray-900 font-medium mt-1">
                  {new Date(userData.join_date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {userData.skills && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Compétences
                  </p>
                  <p className="text-gray-900 font-medium mt-1">
                    {userData.skills}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mes Commentaires - à la place des Statistiques */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Derniers Commentaires
          </h3>

          {/* Liste des commentaires récents sur les plantes */}
          {userComments.length > 0 ? (
            <div className="space-y-3">
              {userComments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm text-gray-600 mb-2">
                    {comment.content}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      Plante: {(comment as any).plant_name || "Inconnue"}
                    </span>
                    <span>
                      {new Date(comment.created_at).toLocaleDateString(
                        "fr-FR",
                        { day: "2-digit", month: "short" }
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun commentaire</p>
            </div>
          )}
        </div>
      </div>

      {/* Section Mes Parcelles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4CAF50]/10 rounded-xl flex items-center justify-center">
              <MapPin className="text-[#4CAF50]" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Mes Parcelles
            </h3>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
          >
            <span className="text-sm">Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {userPlots.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {userPlots.map((plot) => (
              <div
                key={plot.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-[#4CAF50] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{plot.name}</h4>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      plot.status === "occupied"
                        ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {plot.status === "occupied" ? "Occupée" : "Libre"}
                  </span>
                </div>

                {plot.current_plant && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Culture:</span>{" "}
                    {plot.current_plant}
                  </p>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  {plot.surface && <p>Surface: {plot.surface} m²</p>}
                  {plot.soil_type && <p>Sol: {plot.soil_type}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune parcelle assignée</p>
          </div>
        )}
      </div>

      {/* Section Mes Tâches */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="text-blue-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Mes Tâches</h3>
          </div>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-[#4CAF50] hover:text-[#2E7D32] transition-colors"
          >
            <span className="text-sm">Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {userTasks.length > 0 ? (
          <div className="space-y-3">
            {userTasks.map((task) => (
              <div
                key={task.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      task.status === "done"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {task.status === "done"
                      ? "Complétée"
                      : task.status === "in_progress"
                      ? "En cours"
                      : "En attente"}
                  </span>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {task.description}
                  </p>
                )}

                {task.due_date && (
                  <div className="flex items-center text-xs text-gray-500">
                    <span>
                      Échéance:{" "}
                      {new Date(task.due_date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune tâche assignée</p>
          </div>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadUserProfile();
          }}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  userData,
  onClose,
  onSuccess,
}: {
  userData: Member;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone || "",
    skills: userData.skills || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiService.updateMember(userData.id, formData);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Erreur lors de la modification du profil");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Modifier mes informations
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <Input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                className="rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <Input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="rounded-xl"
              placeholder="0123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compétences
            </label>
            <textarea
              value={formData.skills}
              onChange={(e) => handleInputChange("skills", e.target.value)}
              rows={3}
              placeholder="Décrivez vos compétences en jardinage..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl py-3 text-base"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32] py-3 text-base"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
