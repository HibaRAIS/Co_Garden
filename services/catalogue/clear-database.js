import prisma from './src/config/prisma.js';

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');
    
    // Delete all comments first (foreign key constraint)
    await prisma.comment.deleteMany();
    console.log('✅ Deleted all comments');
    
    // Delete all plants
    await prisma.plant.deleteMany();
    console.log('✅ Deleted all plants');
    
    // Delete all admins
    await prisma.admin.deleteMany();
    console.log('✅ Deleted all admins');
    
    console.log('\n✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
