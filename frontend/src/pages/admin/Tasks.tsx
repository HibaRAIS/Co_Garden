import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TaskCard } from "../../components/TaskCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  fetchTasks,
  updateTask,
  deleteTask,
  type ApiTask,
} from "../../services/tasks";
import NewTaskDialog from "../../components/NewTaskDialog";
import EditTaskDialog from "../../components/EditTaskDialog";

// Map backend status <-> UI status expected by TaskCard
type UiStatus = "pending" | "in-progress" | "completed";

const toUiStatus = (s: ApiTask["status"]): UiStatus =>
  s === "to_do" ? "pending" : s === "in_progress" ? "in-progress" : "completed";

const toApiStatus = (s: UiStatus): ApiTask["status"] =>
  s === "pending" ? "to_do" : s === "in-progress" ? "in_progress" : "done";

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

export function Tasks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ local UI state for editing dialog (MUST be inside the component)
  const [editing, setEditing] = useState<ReturnType<typeof toUiTask> | null>(
    null
  );

  async function handleDelete(id: string) {
    await deleteTask(Number(id));
    load();
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTasks({});

      // ✅ S'assurer que data est un tableau
      setApiTasks(Array.isArray(data) ? data : []);
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

  const uiTasks = useMemo(() => apiTasks.map(toUiTask), [apiTasks]);

  const filtered = useMemo(() => {
    let searchedTasks = uiTasks;

    // Apply search filter locally
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      searchedTasks = searchedTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.assignedTo.toLowerCase().includes(query)
      );
    }

    // Calculate counts from searched tasks (before tab filter)
    const all = searchedTasks;
    const pending = searchedTasks.filter((t) => t.status === "pending");
    const inProgress = searchedTasks.filter((t) => t.status === "in-progress");
    const completed = searchedTasks.filter((t) => t.status === "completed");

    return { all, pending, inProgress, completed };
  }, [uiTasks, searchQuery]);

  async function handleStatusChange(taskId: string, newUiStatus: UiStatus) {
    const id = Number(taskId);
    await updateTask(id, { status: toApiStatus(newUiStatus) });
    load();
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Tâches & Événements</h1>
          <p className="text-gray-600">Gérez les activités du jardin</p>
        </div>
        <NewTaskDialog onCreated={load} />
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white rounded-xl p-4 border border-[#E0E0E0]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par titre, description, membres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl h-11"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-[#E0E0E0] rounded-xl p-1">
          <TabsTrigger value="all" className="rounded-lg">
            Toutes ({filtered.all.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg">
            À faire ({filtered.pending.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="rounded-lg">
            En cours ({filtered.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg">
            Terminées ({filtered.completed.length})
          </TabsTrigger>
        </TabsList>

        {/* ALL */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.all.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={(t) => setEditing(t)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </TabsContent>

        {/* PENDING */}
        <TabsContent value="pending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={(t) => setEditing(t)}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {filtered.pending.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche à faire</p>
            </div>
          )}
        </TabsContent>

        {/* IN PROGRESS */}
        <TabsContent value="in-progress" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.inProgress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={(t) => setEditing(t)}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {filtered.inProgress.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche en cours</p>
            </div>
          )}
        </TabsContent>

        {/* COMPLETED (you can allow edit/delete here too if you want) */}
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.completed.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setEditing(t)}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {filtered.completed.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
              <p className="text-gray-500">Aucune tâche terminée</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit dialog mounted once */}
      <EditTaskDialog
        open={!!editing}
        task={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
      />

      {/* Calendar preview stays the same */}
      <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#81C784]/10 rounded-xl p-6 border border-[#4CAF50]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 mb-1">Vue calendrier</h3>
            <p className="text-sm text-gray-600">
              Visualisez vos tâches dans le calendrier
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
            onClick={() => navigate("/admin/calendar")}
          >
            Ouvrir le calendrier
          </Button>
        </div>
      </div>
    </div>
  );
}
