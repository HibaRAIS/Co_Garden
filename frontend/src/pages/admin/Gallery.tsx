import { useState, useEffect, type MouseEvent } from "react";
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Leaf,
  Sprout,
  Edit2,
  Trash2,
  Send,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";

// **MODIFICATION 1: Import Member type for role checking**
import { Member } from "../../services/membreApi";
import { plantsApi, ApiPlant } from "../../services/plantsApi";

interface PlantFormData {
  name: string;
  scientific_name: string;
  type: string;
  description: string;
  care_instructions: string;
  image_url: string;
}

export function Gallery() {
  // **MODIFICATION 2: Admin Role Check Utility**
  const isAdmin = (): boolean => {
    const memberInfoStr = localStorage.getItem("user");
    if (!memberInfoStr) return false;

    try {
      // Assuming 'memberInfo' stores the Member object after successful login
      const memberInfo = JSON.parse(memberInfoStr) as Member;
      return memberInfo.role === "admin";
    } catch (e) {
      console.error("Error parsing member info:", e);
      return false;
    }
  };

  const isAdminUser = isAdmin(); // Check role once per render

  const [plants, setPlants] = useState<ApiPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<ApiPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<ApiPlant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add/Edit plant dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState<ApiPlant | null>(null);
  const [formData, setFormData] = useState<PlantFormData>({
    name: "",
    scientific_name: "",
    type: "",
    description: "",
    care_instructions: "",
    image_url: "",
  });

  // Comment states
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch plants from backend
  useEffect(() => {
    fetchPlants();
  }, []);

  // Filter plants based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlants(plants);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = plants.filter(
        (plant) =>
          plant.name.toLowerCase().includes(query) ||
          plant.scientific_name?.toLowerCase().includes(query) ||
          plant.type?.toLowerCase().includes(query) ||
          plant.description?.toLowerCase().includes(query)
      );
      setFilteredPlants(filtered);
    }
  }, [searchQuery, plants]);

  const fetchPlants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // NOTE: This call should not require a token if the catalogue is public
      const response = await plantsApi.getAll(0, 100);
      setPlants(response.data);
      setFilteredPlants(response.data);
    } catch (err) {
      // NOTE: This is where the delete error message was mistakenly displayed
      setError(err instanceof Error ? err.message : "Failed to fetch plants");
      console.error("Error fetching plants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlantClick = async (plant: ApiPlant) => {
    try {
      // Fetch full plant details with comments
      const fullPlant = await plantsApi.getById(plant.id);
      setSelectedPlant(fullPlant);
      setIsDetailOpen(true);
      setNewComment("");

      // Auto-fill author name from logged-in member
      const memberInfoStr = localStorage.getItem("user");
      if (memberInfoStr) {
        try {
          const memberInfo = JSON.parse(memberInfoStr);
          setCommentAuthor(`${memberInfo.first_name} ${memberInfo.last_name}`);
        } catch {
          setCommentAuthor("");
        }
      } else {
        setCommentAuthor("");
      }
    } catch (err) {
      console.error("Error fetching plant details:", err);
      setSelectedPlant(plant);
      setIsDetailOpen(true);
    }
  };

  const handleOpenAddForm = () => {
    // Basic guard: Prevent opening if not admin (though UI should handle this)
    if (!isAdminUser) {
      setError("Action réservée aux administrateurs.");
      return;
    }
    setIsEditing(false);
    setPlantToEdit(null);
    setFormData({
      name: "",
      scientific_name: "",
      type: "",
      description: "",
      care_instructions: "",
      image_url: "",
    });
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (
    plant: ApiPlant,
    event?: MouseEvent<HTMLButtonElement>
  ) => {
    if (event) {
      event.stopPropagation();
    }
    // Basic guard: Prevent editing if not admin
    if (!isAdminUser) {
      setError("Action réservée aux administrateurs.");
      return;
    }
    setIsEditing(true);
    setPlantToEdit(plant);
    setFormData({
      name: plant.name,
      scientific_name: plant.scientific_name || "",
      type: plant.type || "",
      description: plant.description || "",
      care_instructions: plant.care_instructions || "",
      image_url: plant.image_url || "",
    });
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDeletePlant = async (
    plant: ApiPlant,
    event?: MouseEvent<HTMLButtonElement>
  ) => {
    if (event) {
      event.stopPropagation();
    }

    // Basic guard: Prevent deletion if not admin
    if (!isAdminUser) {
      setError("Action réservée aux administrateurs.");
      return;
    }

    const confirmed = window.confirm(`Supprimer la plante "${plant.name}" ?`);
    if (!confirmed) {
      return;
    }

    try {
      // **MODIFICATION 3: Use the standard 'token' key**
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("Authentification requise pour la suppression.");
      }

      await plantsApi.delete(plant.id, token);
      setSuccess("Plante supprimée avec succès !");
      await fetchPlants();
      setIsDetailOpen(false);
      setSelectedPlant(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de la plante";
      setError(errorMessage);
      console.error("Error deleting plant:", err);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setPlantToEdit(null);
    setFormData({
      name: "",
      scientific_name: "",
      type: "",
      description: "",
      care_instructions: "",
      image_url: "",
    });
  };

  const handleSubmitPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    // Basic guard: Prevent submission if not admin
    if (!isAdminUser) {
      setError("Action réservée aux administrateurs.");
      setIsSaving(false);
      return;
    }

    try {
      // **MODIFICATION 3: Use the standard 'token' key**
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error(
          "Authentification requise pour enregistrer une plante."
        );
      }

      if (isEditing && plantToEdit) {
        await plantsApi.update(plantToEdit.id, formData, token);
        setSuccess("Plante modifiée avec succès !");
      } else {
        await plantsApi.create(formData, token);
        setSuccess("Plante ajoutée avec succès !");
      }

      await fetchPlants();
      handleCloseForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      setError(errorMessage);
      console.error("Error submitting plant:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!selectedPlant || !newComment.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmittingComment(true);
    setError(null);
    setSuccess(null);

    try {
      // **MODIFICATION 3: Use the standard 'token' key**
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error(
          "Vous devez être connecté pour commenter. Veuillez vous connecter d'abord."
        );
      }

      // Get member info from localStorage
      const memberInfoStr = localStorage.getItem("user");
      let author = commentAuthor;

      if (memberInfoStr && !author.trim()) {
        try {
          const memberInfo = JSON.parse(memberInfoStr);
          author = `${memberInfo.first_name} ${memberInfo.last_name}`;
        } catch {
          // If parsing fails, use the input value
        }
      }

      await plantsApi.addComment(
        selectedPlant.id,
        { content: newComment, author: author },
        token
      );

      // Refresh plant details
      const updatedPlant = await plantsApi.getById(selectedPlant.id);
      setSelectedPlant(updatedPlant);
      setNewComment("");
      setCommentAuthor("");
      setSuccess("Commentaire ajouté avec succès !");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout du commentaire";
      setError(errorMessage);
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Catalogue de Plantes
          </h1>
          <p className="text-gray-600">
            {filteredPlants.length} plante{filteredPlants.length > 1 ? "s" : ""}{" "}
            disponible{filteredPlants.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* **MODIFICATION 4: Conditionally render Add Button** */}
        {isAdminUser && (
          <Button
            onClick={handleOpenAddForm}
            className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une plante
          </Button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="rounded-xl border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher une plante par nom, nom scientifique, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-gray-200"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du chargement des plantes: {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPlants}
              className="ml-4"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#4CAF50]" />
          <span className="ml-3 text-gray-600">Chargement des plantes...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredPlants.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-[#E0E0E0]">
          <Sprout className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "Aucune plante trouvée" : "Aucune plante disponible"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "Essayez avec d'autres mots-clés"
              : "Commencez par ajouter des plantes à votre catalogue"}
          </p>
        </div>
      )}

      {/* Plants Grid */}
      {!isLoading && !error && filteredPlants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => handlePlantClick(plant)}
              className="bg-white rounded-xl overflow-hidden border border-[#E0E0E0] hover:shadow-xl hover:border-[#4CAF50]/30 transition-all cursor-pointer group"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                {plant.image_url ? (
                  <img
                    src={plant.image_url}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                ) : null}
                <div
                  className={`${
                    plant.image_url ? "hidden" : ""
                  } w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100`}
                >
                  <Leaf className="h-16 w-16 text-green-300" />
                </div>
                {plant.type && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-[#4CAF50] text-white rounded-full text-xs font-medium">
                    {plant.type}
                  </div>
                )}

                {/* **MODIFICATION 5: Conditionally render Edit/Delete Buttons in grid** */}
                {isAdminUser && (
                  <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white text-gray-700 hover:text-[#2E7D32] border border-black"
                      onClick={(event: MouseEvent<HTMLButtonElement>) =>
                        handleOpenEditForm(plant, event)
                      }
                      title="Modifier la plante"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full border border-black"
                      onClick={(event: MouseEvent<HTMLButtonElement>) =>
                        handleDeletePlant(plant, event)
                      }
                      title="Supprimer la plante"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#4CAF50] transition-colors">
                  {plant.name}
                </h3>
                {plant.scientific_name && (
                  <p className="text-sm text-gray-500 italic mb-3">
                    {plant.scientific_name}
                  </p>
                )}

                {plant.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {plant.description}
                  </p>
                )}

                <div className="pt-3 border-t border-[#E0E0E0]">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Voir les détails</span>
                    <Leaf className="h-4 w-4 text-[#4CAF50]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plant Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPlant && (
            <div>
              <DialogHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <DialogTitle className="text-3xl font-semibold text-gray-900">
                      {selectedPlant.name}
                    </DialogTitle>
                    {selectedPlant.scientific_name && (
                      <p className="text-sm text-gray-500 italic">
                        {selectedPlant.scientific_name}
                      </p>
                    )}
                  </div>

                  {/* **MODIFICATION 6: Conditionally render Edit/Delete Buttons in detail dialog** */}
                  {isAdminUser && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={(event: MouseEvent<HTMLButtonElement>) =>
                          handleOpenEditForm(selectedPlant, event)
                        }
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                        onClick={(event: MouseEvent<HTMLButtonElement>) =>
                          handleDeletePlant(selectedPlant, event)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Image */}
                <div className="relative h-80 rounded-xl overflow-hidden bg-gray-100">
                  {selectedPlant.image_url ? (
                    <img
                      src={selectedPlant.image_url}
                      alt={selectedPlant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                  ) : null}
                  <div
                    className={`${
                      selectedPlant.image_url ? "hidden" : ""
                    } w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100`}
                  >
                    <Leaf className="h-24 w-24 text-green-300" />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPlant.type && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Type
                      </p>
                      <p className="text-gray-900">{selectedPlant.type}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Ajouté le
                    </p>
                    <p className="text-gray-900">
                      {new Date(selectedPlant.created_at).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {selectedPlant.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Description
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedPlant.description}
                    </p>
                  </div>
                )}

                {/* Care Instructions */}
                {selectedPlant.care_instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Instructions d'entretien
                    </p>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedPlant.care_instructions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-3">
                    Commentaires{" "}
                    {selectedPlant.comments &&
                      `(${selectedPlant.comments.length})`}
                  </p>

                  {selectedPlant.comments &&
                    selectedPlant.comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {selectedPlant.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.author}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            <p className="text-gray-700 text-sm">
                              {comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Add Comment Form */}
                  <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#81C784]/10 rounded-xl p-4 border border-[#4CAF50]/20">
                    <h5 className="text-gray-900 font-medium mb-2">
                      Ajouter un commentaire
                    </h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Partagez vos conseils et expériences avec cette plante
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label
                          htmlFor="commentAuthor"
                          className="text-sm text-gray-700 mb-1"
                        >
                          Votre nom
                        </Label>
                        <Input
                          id="commentAuthor"
                          placeholder="Ex: Marie Dubois"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="commentContent"
                          className="text-sm text-gray-700 mb-1"
                        >
                          Votre commentaire
                        </Label>
                        <Textarea
                          id="commentContent"
                          placeholder="Écrivez votre commentaire..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="rounded-xl"
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={
                          isSubmittingComment ||
                          !newComment.trim() ||
                          !commentAuthor.trim()
                        }
                        className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32] w-full"
                      >
                        {isSubmittingComment ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Publier le commentaire
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Plant Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Modifier la plante" : "Ajouter une nouvelle plante"}
            </DialogTitle>
          </DialogHeader>

          {/* Error display in form */}
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmitPlant} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la plante *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Tomate"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientific_name">Nom scientifique</Label>
                <Input
                  id="scientific_name"
                  value={formData.scientific_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scientific_name: e.target.value,
                    })
                  }
                  placeholder="Ex: Solanum lycopersicum"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="Ex: Légume, Fleur, Herbe aromatique..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description détaillée de la plante..."
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="care_instructions">
                Instructions d'entretien
              </Label>
              <Textarea
                id="care_instructions"
                value={formData.care_instructions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    care_instructions: e.target.value,
                  })
                }
                placeholder="Comment prendre soin de cette plante..."
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="rounded-xl"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                disabled={isSaving}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#4CAF50] hover:bg-[#2E7D32]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {isEditing ? "Modifier" : "Ajouter"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
