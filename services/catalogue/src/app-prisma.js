import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import plantsRouter from './routes/plants-prisma.js';

dotenv.config();

/**
 * Créer l'application Express
 */
const app = express();

/**
 * Configuration CORS pour le frontend
 */
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

/**
 * Middleware pour parser le JSON
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Logger middleware (développement uniquement)
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Endpoint racine de l'API
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Co-Garden Catalogue API',
    version: '1.0.0',
    orm: 'Prisma',
    docs: '/api-docs'
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'catalogue-api',
    version: '1.0.0',
    orm: 'Prisma ORM',
    timestamp: new Date().toISOString()
  });
});

/**
 * Inclure les routes API
 */
app.use('/api', plantsRouter);

/**
 * Middleware pour gérer les routes non trouvées
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

/**
 * Middleware global de gestion des erreurs
 */
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
