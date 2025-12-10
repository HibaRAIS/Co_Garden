import { PlotModel } from "../models/plotModel.js";
import { AssignmentRequestModel } from "../models/assignmentRequestModel.js";
import axios from "axios";

const MEMBERS_API_URL =
  process.env.MEMBERS_API_URL || "http://localhost:8001/api/members";
const PLANTS_API_URL =
  process.env.PLANTS_API_URL || "http://localhost:8002/api/plants";

// ==============================================
// FONCTIONS UTILISÉES PAR L'ADMIN ET LE MEMBRE
// ==============================================

/**
 * Récupérer toutes les parcelles
 */
export const getAllPlots = async (req, res) => {
  try {
    const plots = await PlotModel.getAll();
    console.log("[getAllPlots] Parcelles récupérées:", plots?.length || 0);

    // ✅ S'assurer que c'est toujours un tableau
    const plotsArray = Array.isArray(plots) ? plots : [];
    res.status(200).json(plotsArray);
  } catch (error) {
    console.error("[getAllPlots] Erreur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des parcelles" });
  }
};

// ==============================================
// FONCTIONS RÉSERVÉES À L'ADMIN
// ==============================================

export const getAvailablePlants = async (req, res) => {
  try {
    console.log(
      "[Service Parcelles] Requête pour obtenir la liste des plantes..."
    );
    console.log("[Service Parcelles] PLANTS_API_URL =", PLANTS_API_URL);

    // On fait l'appel API au Service Catalogue.
    // On fait suivre le token au cas où cette route deviendrait protégée un jour.
    const response = await axios.get(PLANTS_API_URL, {
      headers: {
        Authorization: req.headers["authorization"],
      },
    });

    // L'API renvoie { data: [...] }, on veut juste le tableau. Adaptez si le format est différent.
    console.log(
      "[Service Parcelles] Réponse du catalogue:",
      JSON.stringify(response.data).substring(0, 200)
    );
    res.status(200).json(response.data.data);
    console.log("[Service Parcelles] Liste des plantes transmise avec succès.");
  } catch (error) {
    console.error(
      "[Service Parcelles] Erreur lors de la récupération des plantes via le Service Catalogue:",
      error.message
    );
    const status = error.response?.status || 500;
    const data = error.response?.data || {
      message: "Impossible de récupérer la liste des plantes.",
    };
    res.status(status).json(data);
  }
};

/**
 * Récupérer la liste des membres (rôle "membre" uniquement)
 */
export const getAvailableMembers = async (req, res) => {
  try {
    console.log(
      "[Service Parcelles] Requête pour obtenir la liste des membres..."
    );
    console.log("[Service Parcelles] MEMBERS_API_URL =", MEMBERS_API_URL);

    const response = await axios.get(MEMBERS_API_URL, {
      headers: { Authorization: req.headers["authorization"] },
    });

    console.log(
      "[Service Parcelles] Réponse du service membres:",
      JSON.stringify(response.data).substring(0, 200)
    );

    const allMembers = response.data.members;
    const filteredMembers = allMembers.filter(
      (member) => member.role === "membre"
    );

    console.log("[Service Parcelles] Liste des membres transmise avec succès.");
    res.status(200).json(filteredMembers);
  } catch (error) {
    console.error(
      "[Service Parcelles] Erreur lors de l'appel à l'API membres:",
      error.message
    );
    console.error("[Service Parcelles] URL tentée:", MEMBERS_API_URL);
    if (error.response) {
      console.error("[Service Parcelles] Status:", error.response.status);
      console.error("[Service Parcelles] Data:", error.response.data);
    }

    const status = error.response?.status || 500;
    const data = error.response?.data || {
      message: "Impossible de récupérer la liste des membres.",
    };
    res.status(status).json(data);
  }
};

/**
 * Créer une nouvelle parcelle
 */
export const createPlot = async (req, res) => {
  try {
    const file = req.file;
    const imageUrl = file
      ? `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      : req.body.image || null;
    const {
      name,
      surface,
      soil_type,
      current_plant,
      plant_emoji,
      occupant,
      occupantid,
    } = req.body;

    const statusValue = occupant ? "occupied" : "available";

    // On passe l'objet complet au modèle
    const newPlot = await PlotModel.create({
      name,
      surface: parseFloat(surface),
      status: statusValue,
      soil_type,
      image: imageUrl,
      current_plant,
      plant_emoji,
      occupant,
      occupantid,
    });

    return res.status(201).json(newPlot);
  } catch (error) {
    console.error("Erreur createPlot:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Assigner un membre à une parcelle
 */
export const assignPlot = async (req, res) => {
  try {
    const { occupantId, occupantName } = req.body;
    const { id } = req.params;
    const updatedPlot = await PlotModel.assign(id, occupantId, occupantName);
    if (!updatedPlot) {
      return res.status(404).json({ message: "Parcelle non trouvée" });
    }
    res
      .status(200)
      .json({ message: "Parcelle assignée avec succès", plot: updatedPlot });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'assignation de la parcelle" });
  }
};

/**
 * Mettre à jour une parcelle
 */
export const updatePlot = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const imageUrl = file
      ? `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      : req.body.image || null;
    const updatedData = {
      ...req.body,
      surface: req.body.surface ? parseFloat(req.body.surface) : undefined,
      image: imageUrl,
    };

    const updatedPlot = await PlotModel.update(id, updatedData);
    if (!updatedPlot) {
      return res.status(404).json({ message: "Parcelle non trouvée" });
    }
    res.status(200).json(updatedPlot);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la parcelle" });
  }
};

/**
 * Supprimer une parcelle
 */
export const deletePlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlot = await PlotModel.remove(id);
    if (!deletedPlot) {
      return res.status(404).json({ message: "Parcelle non trouvée" });
    }
    res
      .status(200)
      .json({ message: "Parcelle supprimée avec succès", plot: deletedPlot });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la parcelle" });
  }
};

// ==============================================
// NOUVELLE FONCTION POUR LES MEMBRES
// ==============================================

/**
 * Permet à un membre connecté de créer une demande d'assignation
 */
export const requestPlotAssignment = async (req, res) => {
  try {
    const { plotId } = req.body;
    // req.user est fourni par le middleware `verifyUser`
    const { id: memberId, first_name, last_name } = req.user;
    const memberName = `${first_name} ${last_name}`;

    if (!plotId) {
      return res
        .status(400)
        .json({ message: "L'ID de la parcelle est requis." });
    }

    // 1. Vérifier que la parcelle est disponible
    const plot = await PlotModel.findById(plotId);
    if (!plot || plot.status !== "available") {
      return res.status(400).json({
        message:
          "Cette parcelle n'est pas ou plus disponible pour une demande.",
      });
    }

    // 2. Vérifier que le membre n'a pas déjà une demande en cours pour CETTE parcelle
    const existingRequest = await AssignmentRequestModel.findExisting(
      memberId,
      plotId
    );
    if (existingRequest) {
      return res.status(400).json({
        message: "Vous avez déjà une demande en cours pour cette parcelle.",
      });
    }

    // 3. Créer la demande dans la base de données
    const newRequest = await AssignmentRequestModel.create({
      plotId,
      userId: memberId,
      motivation: req.body.motivation || `Demande de ${memberName}`,
    });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error(
      "Erreur lors de la création de la demande d'assignation:",
      error
    );
    res.status(500).json({
      message: "Une erreur est survenue lors de la création de votre demande.",
    });
  }
};

/**
 * Récupérer toutes les parcelles pour la VUE MEMBRE
 * (enrichies avec le statut des demandes de cet utilisateur)
 */
export const getAllPlotsForMember = async (req, res) => {
  try {
    // 1. On récupère l'ID de l'utilisateur qui fait la requête (grâce à verifyUser)
    const currentUserId = req.user.id;
    if (!currentUserId) {
      return res.status(401).json({ message: "Utilisateur non identifié." });
    }

    // 2. On appelle la nouvelle fonction du modèle en lui passant l'ID
    const plots = await PlotModel.getAllWithRequestsForUser(currentUserId);

    // 3. On ajoute les booléens que le frontend utilise, pour simplifier
    const enrichedPlots = plots.map((plot) => ({
      ...plot,
      isCurrentUserOccupant: plot.occupantid === currentUserId,
      isCurrentUserRequesting: plot.requestingMemberId === currentUserId,
    }));

    res.status(200).json(enrichedPlots);
  } catch (error) {
    console.error("Erreur getAllPlotsForMember:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des parcelles" });
  }
};

// ==============================================
//  FONCTIONS ADMIN POUR LES DEMANDES
// ==============================================

/**
 * Lister toutes les demandes d'assignation en attente
 */
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await AssignmentRequestModel.findAllPending();
    res.status(200).json(requests);
  } catch (error) {
    console.error("Erreur getPendingRequests:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des demandes." });
  }
};

/**
 * Approuver une demande d'assignation
 */
export const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await AssignmentRequestModel.findById(requestId);

    if (!request || request.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Demande non trouvée ou déjà traitée." });
    }

    // Récupérer les infos du membre depuis l'API membres
    let memberName = `Membre ${request.userId}`;
    try {
      const memberResponse = await axios.get(
        `${MEMBERS_API_URL}/${request.userId}`
      );
      if (memberResponse.data) {
        memberName = `${memberResponse.data.first_name} ${memberResponse.data.last_name}`;
      }
    } catch (error) {
      console.warn("Impossible de récupérer le nom du membre:", error.message);
    }

    // Mettre à jour la parcelle
    await PlotModel.assign(request.plotId, request.userId, memberName);

    // Mettre à jour le statut de la demande
    const updatedRequest = await AssignmentRequestModel.updateStatus(
      requestId,
      "approved"
    );

    // Optionnel : refuser automatiquement les autres demandes pour la même parcelle
    // await AssignmentRequest.rejectOthersForPlot(request.plotId, requestId);

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Erreur approveRequest:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'approbation de la demande." });
  }
};

/**
 * Refuser une demande d'assignation
 */
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await AssignmentRequestModel.findById(requestId);

    if (!request || request.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Demande non trouvée ou déjà traitée." });
    }

    // Mettre à jour le statut de la demande
    const updatedRequest = await AssignmentRequestModel.updateStatus(
      requestId,
      "rejected"
    );

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Erreur rejectRequest:", error);
    res.status(500).json({ message: "Erreur lors du refus de la demande." });
  }
};

/**
 * Lister TOUTES les demandes d'assignation (pending, approved, rejected)
 */
export const getAllRequests = async (req, res) => {
  try {
    const requests = await AssignmentRequestModel.findAll();
    res.status(200).json(requests);
  } catch (error) {
    console.error("Erreur getAllRequests:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération de toutes les demandes.",
    });
  }
};

/**
 * Supprimer une demande d'assignation
 */
export const deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const deletedRequest = await AssignmentRequestModel.remove(requestId);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Demande non trouvée." });
    }
    res.status(200).json({ message: "Demande supprimée avec succès." });
  } catch (error) {
    console.error("Erreur deleteRequest:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la demande." });
  }
};
