const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { authenticateToken, requireRole } = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMemberRequest:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - password
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Marie"
 *         last_name:
 *           type: string
 *           example: "Curie"
 *         email:
 *           type: string
 *           example: "marie@co-garden.fr"
 *         password:
 *           type: string
 *           example: "marie123"
 *         phone:
 *           type: string
 *           example: "0144556677"
 *         skills:
 *           type: string
 *           example: "plantes médicinales"
 *         role:
 *           type: string
 *           enum: [admin, membre]
 *           example: "membre"
 *     UpdateMemberRequest:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Alice"
 *         last_name:
 *           type: string
 *           example: "Dupont"
 *         phone:
 *           type: string
 *           example: "0999888777"
 *         skills:
 *           type: string
 *           example: "jardinage, compostage, permaculture"
 *     ChangeRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [admin, membre]
 *           example: "admin"
 *     MembersList:
 *       type: object
 *       properties:
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Member'
 *         total:
 *           type: integer
 *           example: 5
 */

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Récupérer tous les membres
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des membres récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembersList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authenticateToken, memberController.getAllMembers);

/**
 * @swagger
 * /api/members/{id}:
 *   get:
 *     summary: Récupérer un membre par son ID
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du membre
 *     responses:
 *       200:
 *         description: Membre trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       404:
 *         description: Membre non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", authenticateToken, memberController.getMemberById);

/**
 * @swagger
 * /api/members:
 *   post:
 *     summary: Créer un nouveau membre
 *     tags: [Members]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMemberRequest'
 *     responses:
 *       201:
 *         description: Membre créé avec succès
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Erreur serveur
 */
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  memberController.createMember
);

/**
 * @swagger
 * /api/members/{id}:
 *   put:
 *     summary: Mettre à jour un membre
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMemberRequest'
 *     responses:
 *       200:
 *         description: Membre mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       404:
 *         description: Membre non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", authenticateToken, memberController.updateMember);

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     summary: Supprimer définitivement un membre
 *     description: Cette action est irréversible et supprime toutes les données du membre
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membre supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Membre supprimé définitivement avec succès"
 *       404:
 *         description: Membre non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  memberController.deleteMember
);


module.exports = router;
