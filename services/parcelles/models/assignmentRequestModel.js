import { AssignmentRequest } from "./assignmentRequest.js";
import { Plot } from "./plot.js";

// ==============================================
// NOUVELLE FONCTION POUR LES MEMBRES
// ==============================================

/**
 * Crée une nouvelle demande d'assignation
 */
async function create(data) {
  return await AssignmentRequest.create({
    plotId: data.plotId,
    userId: data.userId || data.memberId, // Support both names
    motivation: data.motivation,
    status: "pending", // Le statut est toujours 'pending' à la création
  });
}

/**
 * Trouve une demande 'pending' existante pour un utilisateur et une parcelle
 */
async function findExisting(userId, plotId) {
  return await AssignmentRequest.findOne({
    where: {
      userId: userId,
      plotId: plotId,
      status: "pending",
    },
  });
}

// ==============================================
// FONCTIONS RÉSERVÉES À L'ADMIN
// ==============================================

/**
 * Récupère toutes les demandes avec le statut 'pending'
 */
async function findAllPending() {
  return await AssignmentRequest.findAll({
    where: { status: "pending" },
    include: [
      {
        model: Plot, // Inclure les détails de la parcelle
        attributes: ["name", "surface", "status"],
      },
    ],
    order: [["requestedAt", "ASC"]],
  });
}

/**
 * Récupère une demande par son ID
 */
async function findById(id) {
  return await AssignmentRequest.findByPk(id);
}

/**
 * Met à jour le statut d'une demande
 */
async function updateStatus(id, newStatus) {
  const request = await AssignmentRequest.findByPk(id);
  if (request) {
    request.status = newStatus;
    request.reviewedAt = new Date();
    await request.save();
  }
  return request;
}

/**
 * Récupère TOUTES les demandes, triées par date
 */
async function findAll() {
  return await AssignmentRequest.findAll({
    include: [
      {
        model: Plot,
        attributes: ["name"],
      },
    ],
    order: [["requestedAt", "DESC"]], // Les plus récentes en premier
  });
}

/**
 * Supprime une demande par son ID
 */
async function remove(id) {
  const request = await AssignmentRequest.findByPk(id);
  if (request) {
    await request.destroy();
  }
  return request;
}

// Plus tard, nous ajouterons ici les fonctions pour lister, approuver et refuser les demandes.

export const AssignmentRequestModel = {
  create,
  findExisting,
  findAllPending,
  findById,
  updateStatus,
  findAll,
  remove,
};
