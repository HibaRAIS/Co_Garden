import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";
import plotsRoutes from './routes/plotsRoutes.js';
import { AssignmentRequest } from './models/assignmentRequest.js';
import { sequelize } from "./db/config.js";



dotenv.config();
const app = express();

// Cette ligne va créer la table si elle n'existe pas
await sequelize.sync();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir le dossier "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middlewares
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173',  'http://localhost:3001'] }));
app.use(express.json());



// Routes API
app.use('/api/plots', plotsRoutes);


//demandes d assignement
//app.use("/api/assignment-requests", assignmentRequestsRoutes);

//Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
