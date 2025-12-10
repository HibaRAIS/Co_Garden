const { verifyToken } = require("../config/jwt");
const Member = require("../models/Member");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "TOKEN_MANQUANT",
      message: "Token d'authentification requis",
    });
  }

  try {
    const decoded = verifyToken(token);
    const member = await Member.findByPk(decoded.id);

    if (!member) {
      return res.status(401).json({
        error: "MEMBRE_INVALIDE",
        message: "Membre non trouvé",
      });
    }

    req.member = member;
    next();
  } catch (error) {
    return res.status(403).json({
      error: "TOKEN_INVALIDE",
      message: "Token invalide ou expiré",
    });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.member.role !== role) {
      return res.status(403).json({
        error: "ACCES_REFUSE",
        message: `Accès réservé aux ${role}s`,
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
};
