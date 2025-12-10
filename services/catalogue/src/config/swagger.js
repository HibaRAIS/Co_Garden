import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Co-Garden Catalogue API',
      version: '1.0.0',
      description: 'API de gestion du catalogue de plantes pour Co-Garden',
      contact: {
        name: 'Co-Garden Team',
        email: 'contact@cogarden.com',
      },
    },
    servers: [
      {
        url: 'http://127.0.0.1:8002',
        description: 'Development server',
      },
      {
        url: 'http://localhost:8002',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Plant: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique de la plante',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Nom commun de la plante',
              example: 'Tomate',
            },
            scientific_name: {
              type: 'string',
              description: 'Nom scientifique de la plante',
              example: 'Solanum lycopersicum',
            },
            type: {
              type: 'string',
              description: 'Type de plante',
              example: 'Légume',
            },
            description: {
              type: 'string',
              description: 'Description détaillée',
              example: 'Légume-fruit très populaire dans les jardins',
            },
            care_instructions: {
              type: 'string',
              description: 'Instructions d\'entretien',
              example: 'Arroser régulièrement, tuteurer les plants',
            },
            image_url: {
              type: 'string',
              description: 'URL de l\'image',
              example: 'https://example.com/image.jpg',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
          },
        },
        Comment: {
          type: 'object',
          required: ['content'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID unique du commentaire',
              example: 1,
            },
            plant_id: {
              type: 'integer',
              description: 'ID de la plante',
              example: 1,
            },
            user_id: {
              type: 'string',
              description: 'ID de l\'utilisateur',
              example: '123',
            },
            author: {
              type: 'string',
              description: 'Nom de l\'auteur',
              example: 'Marie Dubois',
            },
            content: {
              type: 'string',
              description: 'Contenu du commentaire',
              example: 'Super plante, facile à cultiver!',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Type d\'erreur',
            },
            message: {
              type: 'string',
              description: 'Message d\'erreur',
            },
          },
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Plant',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                skip: {
                  type: 'integer',
                  example: 0,
                },
                limit: {
                  type: 'integer',
                  example: 100,
                },
                total: {
                  type: 'integer',
                  example: 50,
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Plants',
        description: 'Gestion des plantes (CRUD Admin)',
      },
      {
        name: 'Comments',
        description: 'Gestion des commentaires (Membres)',
      },
      {
        name: 'Auth',
        description: 'Authentification',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
