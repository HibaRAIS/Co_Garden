const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Member:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         first_name:
 *           type: string
 *           example: "Alice"
 *         last_name:
 *           type: string
 *           example: "Dupont"
 *         email:
 *           type: string
 *           example: "alice@co-garden.fr"
 *         phone:
 *           type: string
 *           example: "0123456789"
 *         role:
 *           type: string
 *           enum: [admin, membre]
 *           example: "membre"
 *         join_date:
 *           type: string
 *           format: date-time
 *         skills:
 *           type: string
 *           example: "jardinage, compostage"
 *         is_active:
 *           type: boolean
 *           example: true
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - password
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Alice"
 *         last_name:
 *           type: string
 *           example: "Dupont"
 *         email:
 *           type: string
 *           example: "alice@co-garden.fr"
 *         password:
 *           type: string
 *           example: "monmotdepasse"
 *         phone:
 *           type: string
 *           example: "0123456789"
 *         skills:
 *           type: string
 *           example: "jardinage, compostage"
 *         role:
 *           type: string
 *           enum: [admin, membre]
 *           example: "membre"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "admin@co-garden.fr"
 *         password:
 *           type: string
 *           example: "admin123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Connexion réussie"
 *         member:
 *           $ref: '#/components/schemas/Member'
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouveau membre
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Membre créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un membre
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Identifiants incorrects
 *       500:
 *         description: Erreur serveur
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil du membre connecté
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du membre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Erreur serveur
 */
router.get("/me", authenticateToken, authController.getCurrentUser); // ✅ Protégé par JWT

module.exports = router;
