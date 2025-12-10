import axios from "axios";

const MEMBERS_AUTH_URL =
  process.env.MEMBERS_AUTH_URL || "http://localhost:8001/api/auth";

export async function verifyAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({
        message: "TOKEN MANQUANT - requête refusée par le Service Parcelles.",
      });
  }

  try {
    // 1. Déléguer la vérification au service Membres
    const response = await axios.get(`${MEMBERS_AUTH_URL}/me`, {
      headers: { Authorization: authHeader },
    });

    const user = response.data;

    // 2. Vérifier le rôle de manière ROBUSTE (insensible à la casse)
    if (!user || !user.role || user.role.toLowerCase() !== "admin") {
      return res
        .status(403)
        .json({
          message:
            "Accès refusé. Cette action est réservée aux administrateurs.",
        });
    }

    // 3. Si tout est bon, continuer
    req.user = user;
    next();
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || {
      message: "Erreur de communication avec le service d'authentification.",
    };
    console.error(
      "ERREUR lors de la communication avec le service Membres:",
      data
    );
    return res.status(status).json(data);
  }
}

/**
 * Middleware pour les routes MEMBRE.
 * Vérifie simplement que le token est valide.
 * N'importe quel membre connecté (admin ou membre) peut passer.
 */
export async function verifyUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token d'authentification requis." });
  }

  try {
    // On délègue toujours la vérification au Service Membres
    const response = await axios.get(`${MEMBERS_AUTH_URL}/me`, {
      headers: { Authorization: authHeader },
    });

    // On attache les informations de l'utilisateur à la requête et on continue
    req.user = response.data;
    next();
  } catch (error) {
    // Si le service Membres renvoie une erreur (401, 403), c'est que le token est invalide.
    const status = error.response?.status || 500;
    const data = error.response?.data || {
      message: "Erreur de communication avec le service d'authentification.",
    };
    return res.status(status).json(data);
  }
}
