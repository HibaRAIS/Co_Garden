// src/controllers/memberController.js
/**
 * @example
 * // Body example for create member:
 * {
 *   "first_name": "Marie",
 *   "last_name": "Curie",
 *   "email": "marie@co-garden.fr",
 *   "password": "marie123",
 *   "phone": "0144556677",
 *   "skills": "plantes médicinales",
 *   "role": "membre"
 * }
 *
 * // Body example for update member:
 * {
 *   "first_name": "Alice",
 *   "phone": "0999888777",
 *   "skills": "jardinage, compostage, permaculture"
 * }
 *
 * // Body example for change role:
 * {
 *   "role": "admin"
 * }
 */
const Member = require("../models/Member");

/**
 * Récupérer tous les membres
 */
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll({
      attributes: {
        exclude: ["password_hash", "createdAt", "updatedAt"],
      },
      order: [
        ["role", "DESC"],
        ["first_name", "ASC"],
      ], // Admins en premier
    });

    res.json({
      members,
      total: members.length,
    });
  } catch (error) {
    console.error("Erreur récupération membres:", error);
    res.status(500).json({
      error: "ERREUR_RECUPERATION_MEMBRES",
      message: "Erreur lors de la récupération des membres",
    });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!member) {
      return res.status(404).json({
        error: "MEMBRE_NON_TROUVE",
        message: `Membre avec l'ID ${req.params.id} non trouvé`,
      });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({
      error: "ERREUR_RECUPERATION_MEMBRE",
      message: "Erreur lors de la récupération du membre",
    });
  }
};

const bcrypt = require("bcrypt"); // ✅ Ajouter bcrypt

exports.createMember = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, skills, role } =
      req.body;

    // Hasher le mot de passe
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newMember = await Member.create({
      first_name,
      last_name,
      email,
      phone,
      password_hash, // ✅ Utiliser le hash directement
      skills,
      role: role || "membre",
    });

    res.status(201).json(newMember.toSafeObject());
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "EMAIL_DEJA_UTILISE",
        message: "Un membre avec cet email existe déjà",
      });
    }

    res.status(500).json({
      error: "ERREUR_CREATION_MEMBRE",
      message: "Erreur lors de la création du membre",
    });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        error: "MEMBRE_NON_TROUVE",
        message: `Membre avec l'ID ${req.params.id} non trouvé`,
      });
    }

    await member.update(req.body);
    res.json(member);
  } catch (error) {
    res.status(500).json({
      error: "ERREUR_MISE_A_JOUR_MEMBRE",
      message: "Erreur lors de la mise à jour du membre",
    });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        error: "MEMBRE_NON_TROUVE",
        message: `Membre avec l'ID ${req.params.id} non trouvé`,
      });
    }

    await member.destroy();
    res.json({
      message: "Membre supprimé définitivement avec succès",
    });
  } catch (error) {
    res.status(500).json({
      error: "ERREUR_SUPPRESSION_MEMBRE",
      message: "Erreur lors de la suppression du membre",
    });
  }
};
