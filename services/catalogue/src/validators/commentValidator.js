import { body } from 'express-validator';

/**
 * Validateurs pour les commentaires
 */

export const createCommentValidator = [
  body('author')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Author name must be between 1 and 200 characters'),

  body('author_id')
    .optional({ values: 'falsy' })
    .isNumeric()
    .withMessage('author_id must be a numeric identifier'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1 })
    .withMessage('Comment content cannot be empty')
];
