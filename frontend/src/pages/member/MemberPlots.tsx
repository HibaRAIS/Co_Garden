import {
  useState,
  useMemo,
  useCallback,
  MouseEvent,
  ReactNode,
  useEffect,
} from "react";
import {
  Search,
  MapPin,
  Send,
  Leaf,
  Sprout,
  Loader2,
  RotateCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Plot, RequestStatus } from "../../lib/plots";
import { PlotCard } from "../../components/PlotCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Plus, User, Check, X } from "lucide-react";
import { plotService } from "../../services/plotService";

export function MemberPlots() {
  // --- STATES DU COMPOSANT ---
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"my_plots" | "available_plots">(
    "my_plots"
  );
  const [requestFilter, setRequestFilter] = useState<
    "accepted" | "pending" | "rejected"
  >("accepted");
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRequestingPlot, setIsRequestingPlot] = useState<number | null>(null);

  // --- EFFET DE CHARGEMENT DES DONNÉES ---
  const fetchAllPlots = useCallback(async () => {
    setLoading(true);
    try {
      const allPlotsData = await plotService.getAllForMember();
      setPlots(allPlotsData);
      setError(null);
    } catch (err) {
      setError(
        "Impossible de charger les données des parcelles. Veuillez réessayer plus tard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPlots();
  }, [fetchAllPlots]);

  // --- ACTIONS DE L'UTILISATEUR ---
  const handleRequestPlot = useCallback(
    async (plotId: number) => {
      const plotName =
        plots.find((p) => p.id === plotId)?.name || `n°${plotId}`;
      if (!confirm(`Confirmez-vous la demande pour la parcelle ${plotName} ?`))
        return;

      setIsRequestingPlot(plotId);
      try {
        await plotService.requestAssignment(plotId);
        await fetchAllPlots(); // Recharger les données pour un état fiable
        alert(`✅ Demande pour la parcelle ${plotName} envoyée avec succès !`);
        setActiveTab("my_plots");
        setRequestFilter("pending");
      } catch (error: any) {
        alert(
          `❌ Erreur: ${
            error.response?.data?.message || "Une erreur est survenue."
          }`
        );
      } finally {
        setIsRequestingPlot(null);
      }
    },
    [plots, fetchAllPlots]
  );

  // --- LOGIQUE DE FILTRAGE ---
  const { filteredPlots, myPlotsCount, availablePlotsCount } = useMemo(() => {
    const allMyRelatedPlots = plots.filter(
      (p) => p.isCurrentUserOccupant || p.isCurrentUserRequesting
    );

    const getPlotRequestStatus = (
      plot: Plot
    ): "accepted" | "pending" | "rejected" | null => {
      if (plot.isCurrentUserOccupant) return "accepted";
      if (plot.isCurrentUserRequesting && plot.requestStatus === "pending")
        return "pending";
      if (plot.isCurrentUserRequesting && plot.requestStatus === "rejected")
        return "rejected";
      return null;
    };

    let plotsToDisplay: Plot[] = [];
    if (activeTab === "my_plots") {
      plotsToDisplay = allMyRelatedPlots.filter(
        (p) => getPlotRequestStatus(p) === requestFilter
      );
    } else {
      plotsToDisplay = plots.filter(
        (p) => p.status === "available" && !p.requestStatus
      );
    }

    const filtered = plotsToDisplay.filter((plot) =>
      plot.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      filteredPlots: filtered,
      myPlotsCount: allMyRelatedPlots.length,
      availablePlotsCount: plots.filter(
        (p) => p.status === "available" && !p.requestStatus
      ).length,
    };
  }, [plots, searchTerm, activeTab, requestFilter]);

  // --- HELPERS D'AFFICHAGE ---
  const getRequestBadge = (plot: Plot): ReactNode => {
    if (plot.isCurrentUserOccupant) {
      return (
        <Badge className="bg-[#4CAF50] text-white text-xs shadow-md flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Ma Parcelle
        </Badge>
      );
    }
    if (plot.isCurrentUserRequesting && plot.requestStatus === "pending") {
      return (
        <Badge className="bg-yellow-600 text-white text-xs shadow-md flex items-center gap-1">
          <RotateCw className="h-3 w-3 animate-spin" /> En Attente
        </Badge>
      );
    }
    if (plot.isCurrentUserRequesting && plot.requestStatus === "rejected") {
      return (
        <Badge className="bg-red-600 text-white text-xs shadow-md flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Refusée
        </Badge>
      );
    }
    return null;
  };

  const requestFilters: {
    value: "accepted" | "pending" | "rejected";
    label: string;
    icon: ReactNode;
    baseColor: string;
    activeColor: string;
  }[] = [
    {
      value: "accepted",
      label: "Mes Parcelles",
      icon: <CheckCircle className="h-4 w-4" />,
      baseColor: "rgb(76, 175, 80)",
      activeColor: "rgb(76, 175, 80)",
    },
    {
      value: "pending",
      label: "En Attente",
      icon: <RotateCw className="h-4 w-4" />,
      baseColor: "rgb(202, 138, 4)",
      activeColor: "rgb(202, 138, 4)",
    },
    {
      value: "rejected",
      label: "Refusées",
      icon: <XCircle className="h-4 w-4" />,
      baseColor: "rgb(220, 38, 38)",
      activeColor: "rgb(220, 38, 38)",
    },
  ];

  // --- RENDU ---
  if (loading) {
    return (
      <div className="text-center p-10 font-semibold text-lg text-gray-600">
        Chargement de votre espace parcelles...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 m-4 rounded-lg"
        role="alert"
      >
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-4" />
          <div>
            <p className="font-bold">Une erreur est survenue</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-10 bg-gray-50 min-h-screen">
      <header className="border-b pb-4 border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-3xl font-bold text-[#1B5E20] flex items-center gap-2">
            Mon Espace Parcelles
          </h1>
        </div>
        <p className="text-gray-600">
          Gérez vos demandes et visualisez les parcelles disponibles.
        </p>
      </header>

      <nav className="flex gap-2 sm:gap-4 border-b-2 border-gray-200">
        <Button
          variant={activeTab === "my_plots" ? "default" : "ghost"}
          onClick={() => {
            setActiveTab("my_plots");
            setRequestFilter("accepted");
          }}
          className={`rounded-t-lg rounded-b-none font-semibold transition-colors flex items-center gap-2 
                                ${
                                  activeTab === "my_plots"
                                    ? "bg-[#4CAF50] hover:bg-[#2E7D32] text-white shadow-lg"
                                    : "text-gray-700 hover:text-[#4CAF50] hover:bg-gray-100"
                                }`}
        >
          <Leaf className="h-5 w-5" /> Mes Parcelles ({myPlotsCount})
        </Button>
        <Button
          variant={activeTab === "available_plots" ? "default" : "ghost"}
          onClick={() => setActiveTab("available_plots")}
          className={`rounded-t-lg rounded-b-none font-semibold transition-colors flex items-center gap-2 
                                ${
                                  activeTab === "available_plots"
                                    ? "bg-[#4CAF50] hover:bg-[#2E7D32] text-white shadow-lg"
                                    : "text-gray-700 hover:text-[#4CAF50] hover:bg-gray-100"
                                }`}
        >
          <Sprout className="h-5 w-5" /> Parcelles Libres ({availablePlotsCount}
          )
        </Button>
      </nav>

      <div className="bg-white rounded-xl p-2 border border-[#E0E0E0] w-full shadow-md">
        <div
          className={`flex flex-col gap-3 ${
            activeTab === "my_plots"
              ? "sm:grid sm:grid-cols-4"
              : "sm:grid sm:grid-cols-1"
          }`}
        >
          <div
            className={`${
              activeTab === "my_plots" ? "sm:col-span-1" : "sm:col-span-full"
            } relative`}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-10 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          {activeTab === "my_plots" && (
            <div className="flex gap-2 flex-wrap sm:col-span-3 items-center">
              <span className="text-sm font-medium text-gray-500 hidden sm:block">
                Filtrer :
              </span>
              {requestFilters.map((filter) => {
                const isActive = requestFilter === filter.value;
                const activeStyle = {
                  backgroundColor: filter.activeColor,
                  color: "white",
                  borderColor: filter.activeColor,
                };
                const inactiveStyle = {
                  backgroundColor: "white",
                  color: filter.baseColor,
                  borderColor: filter.baseColor,
                };
                return (
                  <Button
                    key={filter.value}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setRequestFilter(filter.value)}
                    className={`rounded-full text-xs font-semibold h-8 px-3 transition-colors flex items-center gap-1 shadow-sm border`}
                    style={isActive ? activeStyle : inactiveStyle}
                  >
                    {filter.icon && (
                      <span
                        style={{ color: isActive ? "white" : filter.baseColor }}
                      >
                        {filter.icon}
                      </span>
                    )}
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlots.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-dashed border-gray-300 shadow-inner">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">
              Aucun résultat
            </h3>
            <p className="text-gray-500">
              {activeTab === "my_plots"
                ? `Aucune parcelle ne correspond au statut : "${requestFilter}"`
                : "Toutes les parcelles sont actuellement occupées ou en attente de validation."}
            </p>
          </div>
        ) : (
          filteredPlots.map((plot) => (
            <PlotCard
              key={plot.id}
              plot={plot}
              requestStatusBadge={
                activeTab === "my_plots" ? getRequestBadge(plot) : undefined
              }
              actionButton={
                activeTab === "available_plots" ? (
                  <Button
                    size="sm"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleRequestPlot(plot.id);
                    }}
                    className="rounded-full text-xs shadow-lg transition-transform hover:scale-105 !text-white"
                    style={{
                      backgroundColor: "#E65100",
                      borderColor: "#E65100",
                    }}
                    title="Demander cette parcelle"
                    disabled={isRequestingPlot === plot.id}
                  >
                    {isRequestingPlot === plot.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    {isRequestingPlot === plot.id ? "Envoi..." : "Demander"}
                  </Button>
                ) : undefined
              }
              onClick={() => {
                setSelectedPlot(plot);
                setIsViewDialogOpen(true);
              }}
            />
          ))
        )}
      </section>

      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsViewDialogOpen(open);
          if (!open) setSelectedPlot(null);
        }}
      >
        <DialogContent className="max-w-xl p-0 bg-white shadow-2xl overflow-hidden rounded-2xl">
          {selectedPlot && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>
                  Détails de la parcelle {selectedPlot.name}
                </DialogTitle>
                <DialogDescription>
                  Informations détaillées concernant la parcelle{" "}
                  {selectedPlot.name}, son statut et son occupant.
                </DialogDescription>
              </DialogHeader>
              <div className="relative w-full h-64">
                <img
                  src={
                    typeof selectedPlot.image === "string"
                      ? selectedPlot.image
                      : "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={selectedPlot.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedPlot.name}
                  </h2>
                  <div className="flex gap-2">
                    <Badge
                      className={
                        selectedPlot.isCurrentUserOccupant
                          ? "bg-[#4CAF50] border-2 border-white"
                          : selectedPlot.requestStatus === "pending"
                          ? "bg-yellow-600 border-2 border-white"
                          : "bg-gray-500 border-2 border-white"
                      }
                    >
                      {selectedPlot.isCurrentUserOccupant
                        ? "Ma Parcelle"
                        : selectedPlot.requestStatus === "pending"
                        ? "Demande en Attente"
                        : selectedPlot.status === "occupied"
                        ? "Occupée"
                        : "Disponible"}
                    </Badge>
                    {selectedPlot.current_plant && (
                      <Badge className="bg-white text-gray-800 font-semibold">
                        {selectedPlot.plant_emoji} {selectedPlot.current_plant}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Informations Clés
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <MapPin className="h-6 w-6 text-[#2E7D32]" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Superficie
                      </p>
                      <p className="font-semibold">{selectedPlot.surface} m²</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Leaf className="h-6 w-6 text-yellow-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Type de Sol
                      </p>
                      <p className="font-semibold">{selectedPlot.soil_type}</p>
                    </div>
                  </div>
                  {selectedPlot.occupant && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 col-span-2">
                      <Send className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Occupant
                        </p>
                        <p className="font-semibold">
                          {selectedPlot.occupant}
                          {selectedPlot.requestStatus === "pending" &&
                            " (Demande en attente)"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="p-4 bg-gray-100 rounded-b-2xl">
                <Button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="bg-[#4CAF50] hover:bg-[#2E7D32] text-white font-semibold rounded-xl px-6 py-2 shadow-lg"
                >
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
