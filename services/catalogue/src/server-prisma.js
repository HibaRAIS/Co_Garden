import app from "./app.js";
import prisma, { testConnection, disconnectPrisma } from "./config/prisma.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8002;
const HOST = "0.0.0.0";

/**
 * Démarrer le serveur
 */
const startServer = async () => {
  try {
    // Tester la connexion à la base de données avec Prisma
    await testConnection();

    // Démarrer le serveur Express
    const server = app.listen(PORT, HOST, () => {
      console.log("=================================");
      console.log("🚀 Co-Garden Catalogue API Server");
      console.log("=================================");
      console.log(`📍 Server running at: http://${HOST}:${PORT}`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
      console.log(`📚 API base: http://${HOST}:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🗄️  Database: PostgreSQL with Prisma ORM`);
      console.log("=================================");
    });

    // Gérer l'arrêt gracieux
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} signal received: closing HTTP server`);

      server.close(async () => {
        console.log("HTTP server closed");

        // Déconnecter Prisma
        await disconnectPrisma();
        console.log("Prisma disconnected");

        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await disconnectPrisma();
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();
