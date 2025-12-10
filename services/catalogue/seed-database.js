import prisma from './src/config/prisma.js';

/**
 * Script pour ajouter des données de test dans la base de données
 * À exécuter après la création des tables avec Prisma
 */

async function seedDatabase() {
  console.log('🌱 Seeding database with test data...\n');

  try {
    // Créer quelques plantes de test
    console.log('Creating plants...');
    
    const tomato = await prisma.plant.create({
      data: {
        name: 'Tomato',
        scientific_name: 'Solanum lycopersicum',
        type: 'Vegetable',
        description: 'A popular garden vegetable that produces juicy red fruits. Perfect for salads, sauces, and fresh eating.',
        care_instructions: 'Requires full sun (6-8 hours daily), regular watering, and support for growing. Water deeply 2-3 times per week.',
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', tomato.name);

    const basil = await prisma.plant.create({
      data: {
        name: 'Basil',
        scientific_name: 'Ocimum basilicum',
        type: 'Herb',
        description: 'An aromatic herb used in cooking, especially in Italian cuisine. Fresh leaves have a sweet, peppery flavor.',
        care_instructions: 'Needs warm weather, regular watering, and pinching to promote bushy growth. Harvest leaves regularly.',
        image_url: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', basil.name);

    const rose = await prisma.plant.create({
      data: {
        name: 'Rose',
        scientific_name: 'Rosa',
        type: 'Ornamental',
        description: 'Beautiful flowering plant known for its fragrant blooms. Available in many colors and varieties.',
        care_instructions: 'Requires full sun, well-drained soil, and regular pruning. Water at the base to avoid fungal diseases.',
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', rose.name);

    const carrot = await prisma.plant.create({
      data: {
        name: 'Carrot',
        scientific_name: 'Daucus carota',
        type: 'Vegetable',
        description: 'A root vegetable with a crisp texture and sweet flavor. Rich in beta-carotene and nutrients.',
        care_instructions: 'Needs loose, well-draining soil. Thin seedlings to 2 inches apart. Water consistently.',
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', carrot.name);

    const strawberry = await prisma.plant.create({
      data: {
        name: 'Strawberry',
        scientific_name: 'Fragaria × ananassa',
        type: 'Fruit',
        description: 'Sweet, juicy berries perfect for fresh eating. Produces runners for easy propagation.',
        care_instructions: 'Plant in full sun with well-draining soil. Water regularly and mulch around plants.',
        image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', strawberry.name);

    const lavender = await prisma.plant.create({
      data: {
        name: 'Lavender',
        scientific_name: 'Lavandula',
        type: 'Herb',
        description: 'Aromatic herb with purple flowers. Used in perfumes, cooking, and aromatherapy.',
        care_instructions: 'Prefers full sun and well-drained soil. Drought tolerant once established. Prune after flowering.',
        image_url: 'https://images.unsplash.com/photo-1611251180889-f4d32c4f3b5f?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', lavender.name);

    const sunflower = await prisma.plant.create({
      data: {
        name: 'Sunflower',
        scientific_name: 'Helianthus annuus',
        type: 'Ornamental',
        description: 'Tall, cheerful flowers that follow the sun. Seeds are edible and attract birds.',
        care_instructions: 'Plant in full sun with good drainage. Water regularly during growth. Stake tall varieties.',
        image_url: 'https://images.unsplash.com/photo-1597848212624-e2bb6184e6a8?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', sunflower.name);

    const mint = await prisma.plant.create({
      data: {
        name: 'Mint',
        scientific_name: 'Mentha',
        type: 'Herb',
        description: 'Refreshing herb perfect for teas, desserts, and cocktails. Spreads vigorously.',
        care_instructions: 'Grows in partial shade to full sun. Keep soil moist. Plant in containers to control spreading.',
        image_url: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=500&h=500&fit=crop'
      }
    });
    console.log('✅ Created plant:', mint.name);

    // Ajouter des commentaires aux plantes
    console.log('\nCreating comments...');
    
    const comment1 = await prisma.comment.create({
      data: {
        plant_id: tomato.id,
        user_id: 'user_1',
        author: 'John Doe',
        content: 'Great tomato variety! Very productive and tasty.'
      }
    });
    console.log('✅ Created comment by:', comment1.author);

    const comment2 = await prisma.comment.create({
      data: {
        plant_id: tomato.id,
        user_id: 'user_2',
        author: 'Jane Smith',
        content: 'My favorite tomato for making sauces.'
      }
    });
    console.log('✅ Created comment by:', comment2.author);

    const comment3 = await prisma.comment.create({
      data: {
        plant_id: basil.id,
        user_id: 'user_3',
        author: 'Chef Mario',
        content: 'Essential herb for Italian cooking. Grows well in pots.'
      }
    });
    console.log('✅ Created comment by:', comment3.author);

    // Afficher les statistiques
    const plantCount = await prisma.plant.count();
    const commentCount = await prisma.comment.count();

    console.log('\n✅ Database seeded successfully!');
    console.log(`📊 Total plants: ${plantCount}`);
    console.log(`📊 Total comments: ${commentCount}`);

    // Afficher les plantes avec leurs commentaires
    console.log('\n📋 Plants with comments:');
    const plantsWithComments = await prisma.plant.findMany({
      include: {
        comments: true
      }
    });

    plantsWithComments.forEach(plant => {
      console.log(`\n🌿 ${plant.name} (${plant.type})`);
      console.log(`   Scientific name: ${plant.scientific_name}`);
      console.log(`   Comments: ${plant.comments.length}`);
      plant.comments.forEach(comment => {
        console.log(`   - ${comment.author}: ${comment.content.substring(0, 50)}...`);
      });
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le seeding
seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
