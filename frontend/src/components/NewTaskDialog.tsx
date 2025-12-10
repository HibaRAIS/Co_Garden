// import { useState } from 'react';
// import { createTask, type ApiTask } from '@/api/tasks';
// import { Button } from './ui/button';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
// import { Label } from './ui/label';
// import { Input } from './ui/input';
// import { Textarea } from './ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// type Props = {
//   onCreated?: () => void; // tell parent to refresh after create
// };

// export default function NewTaskDialog({ onCreated }: Props) {
//   const [open, setOpen] = useState(false);
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   // HTML date inputs expect YYYY-MM-DD
//   const [dueDate, setDueDate] = useState<string>('');
//   const [status, setStatus] = useState<ApiTask['status']>('to_do');
//   // simple comma-separated member IDs for now (e.g., "1,2,3")
//   const [members, setMembers] = useState('');

//   const [saving, setSaving] = useState(false);
//   const canSave = title.trim().length > 0 && dueDate;

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!canSave) return;

//     try {
//       setSaving(true);
//       const memberIds = members
//         .split(',')
//         .map(s => s.trim())
//         .filter(Boolean);

//       await createTask({
//         title,
//         description: description || null,
//         due_date: dueDate, // backend expects string date (YYYY-MM-DD is fine)
//         status,
//         memberIds,
//       });

//       // reset form
//       setTitle('');
//       setDescription('');
//       setDueDate('');
//       setStatus('to_do');
//       setMembers('');

//       setOpen(false);
//       onCreated?.(); // asks parent to refresh
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]">
//           + Nouvelle tâche
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Créer une tâche</DialogTitle>
//         </DialogHeader>

//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="grid gap-2">
//             <Label htmlFor="title">Titre</Label>
//             <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={e => setDescription(e.target.value)}
//               placeholder="Détails de la tâche…"
//             />
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="due">Date d’échéance</Label>
//             <Input
//               id="due"
//               type="date"
//               value={dueDate}
//               onChange={e => setDueDate(e.target.value)}
//               required
//             />
//           </div>

//           <div className="grid gap-2">
//             <Label>Statut</Label>
//             <Select value={status} onValueChange={(v: ApiTask['status']) => setStatus(v)}>
//               <SelectTrigger className="rounded-xl">
//                 <SelectValue placeholder="Choisir un statut" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="to_do">À faire</SelectItem>
//                 <SelectItem value="in_progress">En cours</SelectItem>
//                 <SelectItem value="done">Terminée</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="members">Membres assignés (IDs, séparés par des virgules)</Label>
//             <Input
//               id="members"
//               placeholder="ex: 1,2,3"
//               value={members}
//               onChange={e => setMembers(e.target.value)}
//             />
//           </div>

//           <div className="pt-2 flex justify-end gap-2">
//             <Button
//               type="button"
//               variant="outline"
//               className="rounded-xl"
//               onClick={() => setOpen(false)}
//             >
//               Annuler
//             </Button>
//             <Button
//               type="submit"
//               disabled={!canSave || saving}
//               className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
//             >
//               {saving ? 'Enregistrement…' : 'Créer'}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
// src/components/NewTaskDialog.tsx (Admin Frontend) - MODIFIED
// src/components/NewTaskDialog.tsx (Admin Frontend)

import { useEffect, useState, useMemo } from "react";
import { createTask, type ApiTask } from "../services//tasks";
// 💡 Corrected Import for Member Service:
import { apiService, type Member } from "../services/membreApi";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
// Assuming Alert components exist in your UI library
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type Props = {
  onCreated?: () => void; // tell parent to refresh after create
};

export default function NewTaskDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [status, setStatus] = useState<ApiTask["status"]>("to_do");

  // State for members
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  const canSave = title.trim().length > 0 && dueDate;

  // --- Logic to Fetch Members ---
  useEffect(() => {
    if (open) {
      setLoadingMembers(true);
      setMemberError(null);

      apiService
        .getAllMembers()
        .then((response) => {
          // Success: The response structure is { members: Member[], total: number }
          // Filter out admin users
          const nonAdminMembers = response.members.filter(
            (member) => member.role !== "admin"
          );
          setAvailableMembers(nonAdminMembers);
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des membres:", err);
          // Update the error state to display a warning in the UI
          setMemberError(
            "Impossible de charger la liste des membres. Le service Membres est-il actif sur port 8001?"
          );
        })
        .finally(() => {
          setLoadingMembers(false);
        });
    } else {
      // Reset form state when closing the dialog
      setTitle("");
      setDescription("");
      setDueDate("");
      setStatus("to_do");
      setSelectedMemberIds([]);
      setMemberSearchQuery("");
    }
  }, [open]);

  // --- Filter members based on search query ---
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

  // --- Logic to Handle Member Checkbox Toggle ---
  const handleMemberToggle = (memberId: number) => {
    const idString = String(memberId);
    setSelectedMemberIds((prev) =>
      prev.includes(idString)
        ? prev.filter((id) => id !== idString)
        : [...prev, idString]
    );
  };

  // --- Form Submission ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    try {
      setSaving(true);

      console.log("[NewTaskDialog] Creating task with:", {
        title,
        description: description || null,
        due_date: dueDate,
        status,
        memberIds: selectedMemberIds,
      });

      await createTask({
        title,
        description: description || null,
        due_date: dueDate,
        status,
        memberIds: selectedMemberIds, // Array of selected Member IDs (as strings)
      });

      // Success and close
      setOpen(false);
      onCreated?.();
    } catch (error: any) {
      console.error("Error creating task:", error);
      console.error("Error response:", error.response?.data);
      alert(
        "Erreur lors de la création de la tâche. Vérifiez la console et le backend."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]">
          + Nouvelle tâche
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer une tâche</DialogTitle>
          <DialogDescription>
            Créez une nouvelle tâche et assignez-la aux membres du jardin.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails de la tâche…"
            />
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="due">Date d’échéance</Label>
              <Input
                id="due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Statut</Label>
              <Select
                value={status}
                onValueChange={(v: ApiTask["status"]) => setStatus(v)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_do">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="done">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Member Selection List */}
          <div className="grid gap-2">
            <Label>Assigner à :</Label>
            {memberError && (
              <Alert variant="destructive">
                <AlertTitle>Erreur de service</AlertTitle>
                <AlertDescription>{memberError}</AlertDescription>
              </Alert>
            )}
            {loadingMembers ? (
              <p className="text-sm text-gray-500">Chargement des membres...</p>
            ) : (
              <>
                {/* Search Input */}
                <Input
                  type="text"
                  placeholder="Rechercher par nom complet..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="rounded-xl"
                />
                {/* Members List */}
                <div className="max-h-40 overflow-y-auto border p-3 rounded-xl bg-gray-50">
                  {filteredMembers.length === 0 && !memberError ? (
                    <p className="text-sm text-gray-500 italic">
                      {memberSearchQuery
                        ? "Aucun membre ne correspond à la recherche."
                        : "Commencez à taper pour rechercher un membre..."}
                    </p>
                  ) : (
                    filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2 py-1"
                      >
                        <input
                          type="checkbox"
                          id={`member-create-${member.id}`}
                          checked={selectedMemberIds.includes(
                            String(member.id)
                          )}
                          onChange={() => handleMemberToggle(member.id)}
                          className="rounded text-[#4CAF50] focus:ring-[#4CAF50]"
                        />
                        <label
                          htmlFor={`member-create-${member.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {member.first_name} {member.last_name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!canSave || saving || loadingMembers || !!memberError}
              className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
            >
              {saving ? "Enregistrement…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
