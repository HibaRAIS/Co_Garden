import { useEffect, useState } from "react";
import {
  Search,
  User,
  Edit,
  Plus,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  apiService,
  Member,
  CreateMemberData,
  UpdateMemberData,
} from "../../services/membreApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

export function Members() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // États pour le formulaire
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    skills: "",
    password: "",
  });

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery]);

  async function loadMembers() {
    try {
      setLoading(true);
      const response = await apiService.getAllMembers();
      setAllMembers(response.members);

      const regularMembers = response.members.filter(
        (member) => member.role === "membre"
      );
      setMembers(regularMembers);
    } catch (error: any) {
      console.error("Error loading members:", error);
      setError("Erreur lors du chargement des membres");
    } finally {
      setLoading(false);
    }
  }

  function filterMembers() {
    let filtered = members;

    if (searchQuery) {
      filtered = filtered.filter((m) =>
        `${m.first_name} ${m.last_name} ${m.email} ${m.phone || ""} ${
          m.skills || ""
        }`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }

  async function handleDeleteMember(memberId: number) {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer définitivement ce membre ?"
      )
    ) {
      try {
        await apiService.deleteMember(memberId);
        await loadMembers();
        setIsModalOpen(false);
      } catch (error: any) {
        console.error("Error deleting member:", error);
        setError("Erreur lors de la suppression du membre");
      }
    }
  }

  async function handleCreateMember() {
    try {
      const memberData: CreateMemberData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        skills: formData.skills || undefined,
        role: "membre",
      };

      await apiService.createMember(memberData);
      await loadMembers();
      resetForm();
      setIsAddModalOpen(false);
      setError("");
    } catch (error: any) {
      console.error("Error creating member:", error);
      setError(error.message || "Erreur lors de la création du membre");
    }
  }

  async function handleUpdateMember() {
    if (!selectedMember) return;

    try {
      const updateData: UpdateMemberData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || undefined,
        skills: formData.skills || undefined,
      };

      await apiService.updateMember(selectedMember.id, updateData);
      await loadMembers();
      resetForm();
      setIsEditMode(false);
      setIsModalOpen(false);
      setError("");
    } catch (error: any) {
      console.error("Error updating member:", error);
      setError(error.message || "Erreur lors de la modification du membre");
    }
  }

  const handleMemberClick = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
    setIsEditMode(false);
  };

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone: member.phone || "",
      skills: member.skills || "",
      password: "", // Pas de mot de passe pour l'édition
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      skills: "",
      password: "",
    });
    setError("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const stats = {
    total: members.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4CAF50] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900">Gestion des Membres</h1>
          <p className="text-gray-600">
            {stats.total} membre{stats.total > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button
          className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
          onClick={handleAddClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl p-4 border border-[#E0E0E0]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email, téléphone, compétences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl h-11"
            />
          </div>
        </div>
      </div>

      {/* Tableau des membres */}
      {filteredMembers.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 ">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Membre
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Compétences
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Inscrit le
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#4CAF50] to-[#81C784] rounded-full flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone size={14} className="text-gray-400" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-600 max-w-[200px]">
                      {member.skills || (
                        <span className="text-gray-400 italic">
                          Aucune compétence
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(member.join_date).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(member)}
                          className="p-2.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-2.5 text-red-600 border-red-200 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Aucun membre trouvé
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? "Aucun membre ne correspond à vos critères de recherche."
              : "Aucun membre n'est inscrit pour le moment."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="rounded-xl px-6 py-2 mb-6"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}

      {/* Modal d'ajout de membre */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Ajouter un nouveau membre
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer un nouveau compte membre.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <Input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  className="rounded-xl"
                  placeholder="Nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="rounded-xl"
                placeholder="email@exemple.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="rounded-xl"
                placeholder="Mot de passe"
              />
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
              <Textarea
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                className="rounded-xl min-h-[100px]"
                placeholder="Compétences en jardinage, bricolage, etc."
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCreateMember}
                className="flex-1 rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32] py-3 text-base"
                disabled={
                  !formData.first_name ||
                  !formData.last_name ||
                  !formData.email ||
                  !formData.password
                }
              >
                <Save className="h-5 w-5 mr-2" />
                Créer le membre
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 rounded-xl py-3 text-base"
              >
                <X className="h-5 w-5 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de modification de membre */}
      <Dialog
        open={isModalOpen && isEditMode}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setIsEditMode(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Modifier le membre
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations du membre.
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <Input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="rounded-xl"
                />
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
                <Textarea
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  className="rounded-xl min-h-[100px]"
                  placeholder="Compétences en jardinage, bricolage, etc."
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleUpdateMember}
                  className="flex-1 rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32] py-3 text-base"
                  disabled={
                    !formData.first_name ||
                    !formData.last_name ||
                    !formData.email
                  }
                >
                  <Save className="h-5 w-5 mr-2" />
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                  }}
                  className="flex-1 rounded-xl py-3 text-base"
                >
                  <X className="h-5 w-5 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
