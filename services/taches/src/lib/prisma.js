// src/lib/prisma.js
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

// Export for CommonJS (require)
module.exports = prisma;