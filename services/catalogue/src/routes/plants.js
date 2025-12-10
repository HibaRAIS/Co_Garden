import express from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/prisma.js';
import { authenticateAdmin, authenticateUser } from '../middleware/auth.js';
import {
  createPlantValidator,
  plantIdValidator,
  searchQueryValidator,
  paginationValidator
} from '../validators/plantValidator.js';
import { createCommentValidator } from '../validators/commentValidator.js';

const router = express.Router();
const MEMBERS_SERVICE_URL = process.env.MEMBERS_SERVICE_URL || 'http://localhost:8001/api';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * /api/plants:
 *   get:
 *     summary: Obtenir la liste de toutes les plantes
 *     tags: [Plants]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Nombre de plantes à ignorer (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Nombre maximum de plantes à retourner
 *     responses:
 *       200:
 *         description: Liste des plantes avec pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/plants', paginationValidator, handleValidationErrors, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;

    const plants = await prisma.plant.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    const total = await prisma.plant.count();

    res.json({
      data: plants,
      pagination: { skip, limit, total }
    });
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/plants/search:
 *   get:
 *     summary: Rechercher des plantes
 *     tags: [Plants]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *         example: tomate
 *     responses:
 *       200:
 *         description: Plantes correspondant à la recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Paramètre de recherche manquant
 *       500:
 *         description: Erreur serveur
 */
router.get('/plants/search', searchQueryValidator, handleValidationErrors, async (req, res) => {
  try {
    const searchQuery = req.query.q;

    const plants = await prisma.plant.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { scientific_name: { contains: searchQuery, mode: 'insensitive' } },
          { type: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    res.json(plants);
  } catch (error) {
    console.error('Error searching plants:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/plants/{id}:
 *   get:
 *     summary: Obtenir les détails d'une plante
 *     tags: [Plants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la plante
 *     responses:
 *       200:
 *         description: Détails de la plante avec commentaires
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Plant'
 *                 - type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Plante non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/plants/:id', plantIdValidator, handleValidationErrors, async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);

    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
      include: {
        comments: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!plant) {
      return res.status(404).json({
        error: 'Not found',
        message: `Plant with ID ${plantId} not found`
      });
    }

    res.json(plant);
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/plants:
 *   post:
 *     summary: Créer une nouvelle plante (Admin uniquement)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tomate
 *               scientific_name:
 *                 type: string
 *                 example: Solanum lycopersicum
 *               type:
 *                 type: string
 *                 example: Légume
 *               description:
 *                 type: string
 *                 example: Légume-fruit très populaire
 *               care_instructions:
 *                 type: string
 *                 example: Arroser régulièrement
 *               image_url:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Plante créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Plant'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (réservé aux admins)
 *       500:
 *         description: Erreur serveur
 */
router.post('/plants', authenticateAdmin, createPlantValidator, handleValidationErrors, async (req, res) => {
  try {
    const newPlant = await prisma.plant.create({
      data: req.body
    });

    res.status(201).json({
      message: 'Plant created successfully',
      data: newPlant
    });
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/plants/{id}:
 *   put:
 *     summary: Modifier une plante (Admin uniquement)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la plante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               scientific_name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               care_instructions:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plante modifiée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Plante non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/plants/:id', authenticateAdmin, [...plantIdValidator, ...createPlantValidator], handleValidationErrors, async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);

    const existingPlant = await prisma.plant.findUnique({
      where: { id: plantId }
    });

    if (!existingPlant) {
      return res.status(404).json({
        error: 'Not found',
        message: `Plant with ID ${plantId} not found`
      });
    }

    const updatedPlant = await prisma.plant.update({
      where: { id: plantId },
      data: req.body
    });

    res.json({
      message: 'Plant updated successfully',
      data: updatedPlant
    });
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/plants/{id}:
 *   delete:
 *     summary: Supprimer une plante (Admin uniquement)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la plante
 *     responses:
 *       200:
 *         description: Plante supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Plante non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/plants/:id', authenticateAdmin, plantIdValidator, handleValidationErrors, async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);

    const existingPlant = await prisma.plant.findUnique({
      where: { id: plantId }
    });

    if (!existingPlant) {
      return res.status(404).json({
        error: 'Not found',
        message: `Plant with ID ${plantId} not found`
      });
    }

    await prisma.plant.delete({
      where: { id: plantId }
    });

    res.json({
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/plants/{id}/comments:
 *   post:
 *     summary: Ajouter un commentaire (Membre/User uniquement)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la plante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Super plante, facile à cultiver!
 *               author:
 *                 type: string
 *                 example: Marie Dubois
 *     responses:
 *       201:
 *         description: Commentaire ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Plante non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post('/plants/:id/comments', authenticateUser, [...plantIdValidator, ...createCommentValidator], handleValidationErrors, async (req, res) => {
  try {
    const plantId = parseInt(req.params.id);

    const plant = await prisma.plant.findUnique({
      where: { id: plantId }
    });

    if (!plant) {
      return res.status(404).json({
        error: 'Not found',
        message: `Plant with ID ${plantId} not found`
      });
    }

    let authorName = req.body.author?.trim();
  const authorId = req.body.author_id ?? req.user?.id;

    if (!authorName && authorId) {
      try {
        const headers = req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : undefined;
        const response = await fetch(`${MEMBERS_SERVICE_URL}/members/${authorId}`, {
          headers,
        });
        if (response.ok) {
          const member = await response.json();
          const fullName = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim();
          authorName = fullName || member.email || authorName;
        } else {
          console.warn('Unable to resolve author via members service', response.status, await response.text());
        }
      } catch (fetchError) {
        console.error('Error contacting members service for author resolution:', fetchError);
      }
    }

    if (authorId == null) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Author identifier is required'
      });
    }

    if (!authorName) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Author information is required'
      });
    }

    const resolvedUserId = authorId.toString();

    const newComment = await prisma.comment.create({
      data: {
        author: authorName,
        content: req.body.content,
        user_id: resolvedUserId,
        plant_id: plantId
      }
    });

    res.status(201).json({
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/plants/{plantId}/comments/{commentId}:
 *   delete:
 *     summary: Supprimer un commentaire (Auteur ou Admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: plantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la plante
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du commentaire
 *     responses:
 *       200:
 *         description: Commentaire supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (seul l'auteur ou admin peut supprimer)
 *       404:
 *         description: Commentaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/plants/:plantId/comments/:commentId', authenticateUser, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Comment not found'
      });
    }

    if (comment.user_id !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own comments'
      });
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
