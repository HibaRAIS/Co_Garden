const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "votre_clé_secrète_super_sécurisée_changez_moi";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Token invalide");
  }
}

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
};
