import { body, param, query } from 'express-validator';

/**
 * Validateurs pour les plantes
 */

export const createPlantValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters'),
  
  body('scientific_name')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Scientific name must not exceed 300 characters'),
  
  body('type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Type must not exceed 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('care_instructions')
    .optional()
    .trim(),
  
  body('image_url')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Image URL must not exceed 500 characters')
];

export const plantIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Plant ID must be a positive integer')
];

export const searchQueryValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
];

export const paginationValidator = [
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be a non-negative integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
