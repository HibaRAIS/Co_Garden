import { useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, Leaf, Send, Sprout } from "lucide-react";
import { plantsApi, type ApiPlant } from "../../services/plantsApi";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useAuth } from "../../contexts/AuthContext";

export function Gallery() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<ApiPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<ApiPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<ApiPlant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlants(plants);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = plants.filter((plant: ApiPlant) => {
      return (
        plant.name.toLowerCase().includes(query) ||
        plant.scientific_name?.toLowerCase().includes(query) ||
        plant.type?.toLowerCase().includes(query) ||
        plant.description?.toLowerCase().includes(query)
      );
    });

    setFilteredPlants(filtered);
  }, [searchQuery, plants]);

  const fetchPlants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await plantsApi.getAll(0, 100);
      setPlants(response.data);
      setFilteredPlants(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les plantes"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlantClick = async (plant: ApiPlant) => {
    try {
      const fullPlant = await plantsApi.getById(plant.id);
      setSelectedPlant(fullPlant);
      setIsDetailOpen(true);
      setNewComment("");
    } catch (err) {
      setSelectedPlant(plant);
      setIsDetailOpen(true);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des détails"
      );
    }
  };

  const handleSubmitComment = async () => {
    if (!selectedPlant || !newComment.trim() || !user) {
      return;
    }

    setIsSubmittingComment(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        throw new Error("Connexion requise pour commenter.");
      }

      const author = `${user.first_name} ${user.last_name}`.trim() || "Membre";
      await plantsApi.addComment(
        selectedPlant.id,
        { content: newComment, author, author_id: user.id },
        token
      );

      const updatedPlant = await plantsApi.getById(selectedPlant.id);
      setSelectedPlant(updatedPlant);
      setNewComment("");
      setSuccess("Commentaire ajouté avec succès!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout du commentaire"
      );
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
            Plantes du jardin
          </h1>
          <p className="text-gray-600">
            {filteredPlants.length} plante{filteredPlants.length > 1 ? "s" : ""}{" "}
            partagée{filteredPlants.length > 1 ? "s" : ""} par l'équipe
          </p>
        </div>
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
            {error}
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
          <p className="text-gray-600">
            {searchQuery
              ? "Essayez avec d'autres mots-clés"
              : "Les plantes ajoutées par les administrateurs apparaîtront ici"}
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
                  <div className="absolute top-3 right-3 px-3 py-1 bg-[#4CAF50] rounded-full text-xs font-medium text-white shadow-md">
                    {plant.type}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPlant && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-3xl font-semibold text-gray-900">
                  {selectedPlant.name}
                </DialogTitle>
                {selectedPlant.scientific_name && (
                  <p className="text-sm text-gray-500 italic">
                    {selectedPlant.scientific_name}
                  </p>
                )}
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
                    <h5 className="text-gray-900 font-medium mb-3">
                      Ajouter un commentaire
                    </h5>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Partagez vos conseils et expériences avec cette plante..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="rounded-xl"
                        rows={3}
                      />
                      <Button
                        onClick={handleSubmitComment}
                        disabled={isSubmittingComment || !newComment.trim()}
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
    </div>
  );
}
