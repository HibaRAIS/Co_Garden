import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TaskCard } from "../../components/TaskCard";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { fetchTasks, updateTask, type ApiTask } from "../../services/tasks";
import { apiService } from "../../services/membreApi";

// Map backend status <-> UI status expected by TaskCard
type UiStatus = "pending" | "in-progress" | "completed";

const toUiStatus = (s: ApiTask["status"]): UiStatus =>
  s === "to_do" ? "pending" : s === "in_progress" ? "in-progress" : "completed";

// Adapt backend task to TaskCard's expected props
function toUiTask(t: ApiTask) {
  return {
    id: String(t.id),
    title: t.title,
    date: t.due_date ?? "",
    assignedTo:
      t.assigned_members && t.assigned_members.length
        ? t.assigned_members.join(", ")
        : "—",
    assignedToId: "",
    status: toUiStatus(t.status),
    type: "other" as const,
    description: t.description ?? undefined,
  };
}

export function MemberTasks() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer l'utilisateur connecté
      const currentUser = await apiService.getCurrentUser();

      // Charger toutes les tâches
      const allTasks = await fetchTasks({});

      // Filtrer les tâches assignées au membre
      const memberTasks = allTasks.filter((task: ApiTask) =>
        task.assigned_members?.includes(String(currentUser.id))
      );

      setApiTasks(Array.isArray(memberTasks) ? memberTasks : []);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
      setApiTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handle status change for members
  const handleStatusChange = async (taskId: string, newStatus: UiStatus) => {
    try {
      // Map UI status back to API status
      const apiStatus: ApiTask["status"] =
        newStatus === "pending"
          ? "to_do"
          : newStatus === "in-progress"
          ? "in_progress"
          : "done";

      await updateTask(Number(taskId), { status: apiStatus });

      // Reload tasks to reflect changes
      await load();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const uiTasks = useMemo(() => apiTasks.map(toUiTask), [apiTasks]);

  const filtered = useMemo(() => {
    let tasks = uiTasks;

    // Apply search filter locally
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.assignedTo.toLowerCase().includes(query)
      );
    }

    const all = tasks;
    const pending = tasks.filter((t) => t.status === "pending");
    const inProgress = tasks.filter((t) => t.status === "in-progress");
    const completed = tasks.filter((t) => t.status === "completed");
    return { all, pending, inProgress, completed };
  }, [uiTasks, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Mes Tâches</h1>
          <p className="text-gray-600">Suivez vos tâches assignées</p>
        </div>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white rounded-xl p-4 border border-[#E0E0E0]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl h-11"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-[#E0E0E0] rounded-xl p-1">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white"
          >
            Toutes ({filtered.all.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-lg data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white"
          >
            À faire ({filtered.pending.length})
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="rounded-lg data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white"
          >
            En cours ({filtered.inProgress.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-lg data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white"
          >
            Terminées ({filtered.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filtered.all.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche assignée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.all.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={undefined}
                  onStatusChange={handleStatusChange}
                  onEdit={undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {filtered.pending.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche en attente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.pending.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={undefined}
                  onStatusChange={handleStatusChange}
                  onEdit={undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          {filtered.inProgress.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche en cours</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.inProgress.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={undefined}
                  onStatusChange={handleStatusChange}
                  onEdit={undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {filtered.completed.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche terminée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.completed.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={undefined}
                  onStatusChange={handleStatusChange}
                  onEdit={undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
