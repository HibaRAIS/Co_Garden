import { Plot } from "./plot.js";
import { sequelize } from "../db/config.js";

/**
 * Récupère toutes les parcelles
 */
async function getAll() {
  return await Plot.findAll({ order: [["id", "ASC"]] });
}

/**
 * Récupère TOUTES les parcelles et les enrichit avec le statut de la demande
 * LA PLUS RÉCENTE pour l'utilisateur spécifié.
 */
async function getAllWithRequestsForUser(currentUserId) {
  // Cette requête SQL utilise une sous-requête pour trouver le statut et l'ID du demandeur
  // de la dernière demande faite par l'utilisateur courant pour chaque parcelle.
  const [results] = await sequelize.query(
    `
    SELECT
      p.*,
      sub.status AS "requestStatus",
      sub.user_id AS "requestingMemberId"
    FROM
      parcelles.plots p
    LEFT JOIN (
      SELECT
        plot_id,
        status,
        user_id,
        -- On utilise ROW_NUMBER pour ne garder que la demande la plus récente par parcelle
        ROW_NUMBER() OVER(PARTITION BY plot_id ORDER BY requested_at DESC) as rn
      FROM
        parcelles.assignment_requests
      WHERE
        user_id = :currentUserId
    ) AS sub ON p.id = sub.plot_id AND sub.rn = 1
    ORDER BY
      p.id ASC;
  `,
    {
      replacements: { currentUserId: currentUserId }, // On injecte l'ID de l'utilisateur de manière sécurisée
    }
  );
  return results;
}

/**
 * Crée une nouvelle parcelle
 */
async function create(data) {
  return await Plot.create({
    name: data.name,
    surface: data.surface,
    status: data.status || "available",
    soil_type: data.soil_type,
    image: data.image,
    current_plant: data.current_plant,
    plant_emoji: data.plant_emoji,
    occupant: data.occupant,
    occupantid: data.occupantid || null,
  });
}

/**
 * Assigne un membre (occupant) à une parcelle
 */
async function assign(plotId, occupantId, occupantName) {
  const plot = await Plot.findByPk(plotId);
  if (!plot) return null;

  plot.status = "occupied";
  plot.occupantid = occupantId;
  plot.occupant = occupantName;

  await plot.save();
  return plot;
}

/**
 * Met à jour les informations d’une parcelle
 */
async function update(id, data) {
  const plot = await Plot.findByPk(id);
  if (!plot) return null;

  await plot.update({
    name: data.name,
    surface: data.surface,
    status: data.status,
    occupantid: data.occupantid || null,
    soil_type: data.soil_type,
    image: data.image,
    current_plant: data.current_plant,
    plant_emoji: data.plant_emoji,
    occupant: data.occupant,
  });

  return plot;
}

/**
 * Supprime une parcelle
 */
async function remove(id) {
  const plot = await Plot.findByPk(id);
  if (!plot) return null;

  await plot.destroy();
  return plot;
}

/**
 * Récupère toutes les parcelles en y joignant les demandes en cours ('pending')
 */
async function getAllWithRequests() {
  const [results] = await sequelize.query(`
    SELECT
      p.*,
      ar.status as "requestStatus",
      ar.user_id as "requestingMemberId"
    FROM
      parcelles.plots p
    LEFT JOIN
      parcelles.assignment_requests ar ON p.id = ar.plot_id AND ar.status = 'pending'
    ORDER BY
      p.id ASC;
  `);
  return results;
}

/**
 * Récupère une parcelle par son ID
 */
async function findById(id) {
  return await Plot.findByPk(id);
}

// On met à jour l'export pour utiliser la nouvelle fonction `getAll` et ajouter `findById`
export const PlotModel = {
  getAllWithRequestsForUser,
  getAll,
  create,
  assign,
  update,
  remove,
  findById, // On ajoute la nouvelle fonction
};
