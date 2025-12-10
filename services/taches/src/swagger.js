const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CoGarden Tâches API',
      version: '1.0.0',
      description: 'API documentation for task management service',
    },
    servers: [
      {
        url: 'http://localhost:4002/api',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // 👈 Location of your route files
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
