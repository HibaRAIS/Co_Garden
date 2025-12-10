import multer from "multer";
import express from "express";
import {
  getAllPlots,
  createPlot,
  assignPlot,
  deletePlot,
  updatePlot,
  getAvailableMembers,
  getAvailablePlants,
  requestPlotAssignment,
  getAllPlotsForMember,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getAllRequests,
  deleteRequest,
} from "../controllers/plotsController.js";
const router = express.Router();

import { verifyAdmin, verifyUser } from "../middleware/authMiddleware.js";

// configuration multer (dossier uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${unique}.${ext}`);
  },
});
const upload = multer({ storage });

// ==============================================
// ROUTES POUR LES MEMBRES (protégées par verifyUser)
// ==============================================

// Permet à un membre connecté de voir la liste de toutes les parcelles
router.get("/member-view", verifyUser, getAllPlotsForMember);
//router.get('/member-view', verifyUser, getAllPlots);
// Permet à un membre de soumettre une demande pour une parcelle
router.post("/request-assignment", verifyUser, requestPlotAssignment);

// ==============================================
// ROUTES POUR LES ADMINS (protégées par verifyAdmin)
// ==============================================

// Routes pour peupler les listes déroulantes du formulaire admin (AVANT les routes génériques!)
router.get(
  "/available-members",
  (req, res, next) => {
    console.log("[ROUTE] /available-members matched");
    next();
  },
  verifyAdmin,
  getAvailableMembers
);

router.get(
  "/available-plants",
  (req, res, next) => {
    console.log("[ROUTE] /available-plants matched");
    next();
  },
  verifyAdmin,
  getAvailablePlants
);

router.get(
  "/",
  (req, res, next) => {
    console.log("[ROUTE] / matched for path:", req.path);
    next();
  },
  verifyAdmin,
  getAllPlots
);
router.post("/", verifyAdmin, upload.single("image"), createPlot);
router.put("/:id/assign", verifyAdmin, assignPlot);
router.delete("/:id", verifyAdmin, deletePlot);
router.put("/:id", verifyAdmin, upload.single("image"), updatePlot);

//  NOUVELLES ROUTES ADMIN POUR GÉRER LES DEMANDES
router.get("/assignment-requests/all", verifyAdmin, getAllRequests);
router.get("/assignment-requests", verifyAdmin, getPendingRequests);
router.post(
  "/assignment-requests/:requestId/approve",
  verifyAdmin,
  approveRequest
);
router.post(
  "/assignment-requests/:requestId/reject",
  verifyAdmin,
  rejectRequest
);
router.delete("/assignment-requests/:requestId", verifyAdmin, deleteRequest);

export default router;
