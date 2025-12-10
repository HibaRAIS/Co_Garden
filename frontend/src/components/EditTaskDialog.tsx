// src/components/EditTaskDialog.tsx
import { useEffect, useMemo, useState } from "react";
import { updateTask, type ApiTask } from "../services/tasks";
import { apiService, type Member } from "../services/membreApi";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type UiStatus = "pending" | "in-progress" | "completed";
const toApi = (s: UiStatus): ApiTask["status"] =>
  s === "pending" ? "to_do" : s === "in-progress" ? "in_progress" : "done";

type UiTask = {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO or YYYY-MM-DD
  status: UiStatus;
  assignedTo: string; // display string (comma-separated)
  assignedToIds?: string[];
};

type Props = {
  open: boolean;
  task: UiTask | null;
  onClose: () => void;
  onSaved?: () => void;
};

const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

export default function EditTaskDialog({
  open,
  task,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<UiStatus>("pending");
  const [saving, setSaving] = useState(false);

  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Hydrate + load members when dialog opens
  useEffect(() => {
    if (!open || !task) return;

    setTitle(task.title ?? "");
    setDesc(task.description ?? "");
    setDate(formatDateForInput(task.date));
    setStatus(task.status);
    setMemberError(null);
    setMemberSearchQuery("");

    // pre-select members
    const initialIds =
      task.assignedToIds ??
      (task.assignedTo === "—" ? [] : task.assignedTo.split(", "));
    setSelectedMemberIds((initialIds || []).filter(Boolean));

    setLoadingMembers(true);
    apiService
      .getAllMembers()
      .then((res) => {
        // Filter out admin users
        const nonAdminMembers = res.members.filter(
          (member) => member.role !== "admin"
        );
        setAvailableMembers(nonAdminMembers);
      })
      .catch((err) => {
        console.error("[EditTaskDialog] members error:", err);
        setMemberError("Impossible de charger la liste des membres.");
      })
      .finally(() => setLoadingMembers(false));
  }, [open, task]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) {
      return []; // N'afficher aucun membre si pas de recherche
    }
    const query = memberSearchQuery.toLowerCase();
    return availableMembers.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [availableMembers, memberSearchQuery]);

  const toggleMember = (memberId: number) => {
    const id = String(memberId);
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !title || !date) return;

    try {
      setSaving(true);
      await updateTask(Number(task.id), {
        title,
        description: desc || null,
        due_date: date, // API accepts YYYY-MM-DD
        status: toApi(status),
        memberIds: selectedMemberIds,
      });
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const MemberContent = useMemo(() => {
    if (memberError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Erreur de service</AlertTitle>
          <AlertDescription>{memberError}</AlertDescription>
        </Alert>
      );
    }
    if (loadingMembers)
      return <p className="text-sm text-gray-500">Chargement des membres…</p>;
    if (!availableMembers.length)
      return <p className="text-sm text-gray-500">Aucun membre disponible.</p>;

    return (
      <>
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Rechercher par nom complet..."
          value={memberSearchQuery}
          onChange={(e) => setMemberSearchQuery(e.target.value)}
          className="rounded-xl mb-2"
        />
        {/* Members List */}
        <div className="max-h-48 overflow-y-auto border rounded-xl bg-white p-3">
          {filteredMembers.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              {memberSearchQuery
                ? "Aucun membre ne correspond à la recherche."
                : "Commencez à taper pour rechercher un membre..."}
            </p>
          ) : (
            filteredMembers.map((m) => {
              const id = String(m.id);
              return (
                <label
                  key={id}
                  htmlFor={`member-edit-${id}`}
                  className="flex items-center gap-2 py-1 cursor-pointer"
                >
                  <input
                    id={`member-edit-${id}`}
                    type="checkbox"
                    checked={selectedMemberIds.includes(id)}
                    onChange={() => toggleMember(m.id)}
                    className="rounded text-[#4CAF50] focus:ring-[#4CAF50]"
                  />
                  <span className="text-sm leading-none">
                    {m.first_name} {m.last_name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </>
    );
  }, [
    availableMembers,
    loadingMembers,
    memberError,
    selectedMemberIds,
    memberSearchQuery,
    filteredMembers,
  ]);

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la tâche</DialogTitle>
          <DialogDescription>
            Modifiez les détails, le statut et les assignations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="t">Titre</Label>
            <Input
              id="t"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="d">Description</Label>
            <Textarea
              id="d"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Date & Status (responsive 2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due">Date d’échéance</Label>
              <Input
                id="due"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Statut</Label>
              <Select
                value={status}
                onValueChange={(v: UiStatus) => setStatus(v)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">À faire</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Members */}
          <div className="grid gap-2">
            <Label>Assigner à</Label>
            {MemberContent}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
              disabled={
                saving || loadingMembers || !!memberError || !title || !date
              }
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
