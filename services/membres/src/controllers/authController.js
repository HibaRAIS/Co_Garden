/**
 * @example
 * // Body example for register:
 * {
 *   "first_name": "Alice",
 *   "last_name": "Dupont",
 *   "email": "alice@co-garden.fr",
 *   "password": "alice123",
 *   "phone": "0123456789",
 *   "skills": "jardinage bio",
 *   "role": "membre"
 * }
 *
 * // Body example for login:
 * {
 *   "email": "admin@co-garden.fr",
 *   "password": "admin123"
 * }
 */
const Member = require("../models/Member");
const bcrypt = require("bcrypt");
const { generateToken } = require("../config/jwt");

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, skills, role } =
      req.body;

    const existingMember = await Member.findOne({ where: { email } });
    if (existingMember) {
      return res.status(400).json({
        error: "EMAIL_DEJA_UTILISE",
        message: "Un membre avec cet email existe déjà",
      });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newMember = await Member.create({
      first_name,
      last_name,
      email,
      phone,
      password_hash,
      skills,
      role: role || "membre",
    });

    // Générer le token JWT
    const token = generateToken({
      id: newMember.id,
      email: newMember.email,
      role: newMember.role,
    });

    res.status(201).json({
      message: "Inscription réussie",
      member: newMember.toSafeObject(),
      token,
    });
  } catch (error) {
    console.error("Erreur inscription:", error);
    res.status(500).json({
      error: "ERREUR_INSCRIPTION",
      message: "Erreur lors de l'inscription",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const member = await Member.findOne({ where: { email } });
    if (!member) {
      return res.status(401).json({
        error: "IDENTIFIANTS_INCORRECTS",
        message: "Email ou mot de passe incorrect",
      });
    }

    const isValidPassword = await member.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "IDENTIFIANTS_INCORRECTS",
        message: "Email ou mot de passe incorrect",
      });
    }

    // Générer le token JWT
    const token = generateToken({
      id: member.id,
      email: member.email,
      role: member.role,
    });

    res.json({
      message: "Connexion réussie",
      member: member.toSafeObject(),
      token,
    });
  } catch (error) {
    console.error("Erreur connexion:", error);
    res.status(500).json({
      error: "ERREUR_CONNEXION",
      message: "Erreur lors de la connexion",
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // Maintenant req.member est disponible grâce au middleware
    res.json(req.member.toSafeObject());
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({
      error: "ERREUR_RECUPERATION_PROFIL",
      message: "Erreur lors de la récupération du profil",
    });
  }
};

exports.logout = async (req, res) => {
  // Avec JWT, la déconnexion se fait côté client en supprimant le token
  res.json({ message: "Déconnexion réussie" });
};
