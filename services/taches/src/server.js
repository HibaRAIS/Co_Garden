const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// 👇 Optional root route
app.get('/', (req, res) => {
  res.send('🎉 Co-Garden Tâches API is running!');
});

// 👇 Swagger setup
const setupSwagger = require('./swagger'); // <--- Add this
setupSwagger(app);                         // <--- And this

// Import task routes
const taskRoutes = require('./routes/tasks.routes');
app.use('/api', taskRoutes);  // Routes will be prefixed with /api

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api-docs`);
});

const prisma = require('./lib/prisma');

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
