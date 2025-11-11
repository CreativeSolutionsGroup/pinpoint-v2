// Seed script to create example diagram with lake image
// Run with: npx tsx prisma/seed-diagram.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 Creating example lake diagram...');

  // Check if example diagram already exists
  const existing = await prisma.diagram.findFirst({
    where: { name: 'Lake Event Setup Example' },
  });

  if (existing) {
    console.log('✓ Example diagram already exists. Deleting old one...');
    await prisma.diagram.delete({ where: { id: existing.id } });
  }

  // Create the diagram
  const diagram = await prisma.diagram.create({
    data: {
      name: 'Lake Event Setup Example',
      description: 'Example outdoor event setup at the lake with various equipment and seating arrangements',
      imageUrl: '/lake-updated-v2.png',
      imageWidth: 1920, // Approximate - adjust if you know actual dimensions
      imageHeight: 1080, // Approximate - adjust if you know actual dimensions
      userId: 'example-user-id', // Replace with actual user ID when auth is integrated
    },
  });

  console.log(`✓ Created diagram: ${diagram.name} (ID: ${diagram.id})`);

  // Create example items on the diagram
  const items = [
    // Main stage area
    {
      iconType: 'stage',
      name: 'Main Stage',
      description: 'Primary performance area facing the lake',
      x: 400,
      y: 200,
      width: 120,
      height: 80,
      rotation: 0,
      color: '#8B4513',
      opacity: 0.9,
      zIndex: 1,
    },
    // Speakers
    {
      iconType: 'speaker',
      name: 'Left Speaker',
      description: 'Main PA speaker - left side',
      x: 350,
      y: 180,
      width: 40,
      height: 50,
      rotation: 25,
      color: '#000000',
      opacity: 1.0,
      zIndex: 2,
    },
    {
      iconType: 'speaker',
      name: 'Right Speaker',
      description: 'Main PA speaker - right side',
      x: 560,
      y: 180,
      width: 40,
      height: 50,
      rotation: -25,
      color: '#000000',
      opacity: 1.0,
      zIndex: 2,
    },
    // DJ Booth
    {
      iconType: 'dj-booth',
      name: 'DJ Station',
      description: 'DJ equipment and mixing board',
      x: 430,
      y: 220,
      width: 60,
      height: 45,
      rotation: 0,
      color: '#4169E1',
      opacity: 1.0,
      zIndex: 3,
    },
    // Seating area - tables and chairs
    {
      iconType: 'table',
      name: 'VIP Table 1',
      description: 'Reserved seating for VIP guests',
      x: 250,
      y: 350,
      width: 70,
      height: 70,
      rotation: 0,
      color: '#8B4513',
      opacity: 0.9,
      zIndex: 1,
    },
    {
      iconType: 'chair',
      name: 'Chair',
      description: '',
      x: 240,
      y: 340,
      width: 35,
      height: 35,
      rotation: 180,
      color: '#696969',
      opacity: 1.0,
      zIndex: 2,
    },
    {
      iconType: 'chair',
      name: 'Chair',
      description: '',
      x: 290,
      y: 340,
      width: 35,
      height: 35,
      rotation: 180,
      color: '#696969',
      opacity: 1.0,
      zIndex: 2,
    },
    {
      iconType: 'chair',
      name: 'Chair',
      description: '',
      x: 240,
      y: 430,
      width: 35,
      height: 35,
      rotation: 0,
      color: '#696969',
      opacity: 1.0,
      zIndex: 2,
    },
    {
      iconType: 'chair',
      name: 'Chair',
      description: '',
      x: 290,
      y: 430,
      width: 35,
      height: 35,
      rotation: 0,
      color: '#696969',
      opacity: 1.0,
      zIndex: 2,
    },
    // Second table
    {
      iconType: 'table',
      name: 'Guest Table 1',
      description: 'General seating area',
      x: 600,
      y: 350,
      width: 70,
      height: 70,
      rotation: 0,
      color: '#8B4513',
      opacity: 0.9,
      zIndex: 1,
    },
    // Lighting
    {
      iconType: 'spotlight',
      name: 'Stage Light Left',
      description: 'Main stage lighting',
      x: 380,
      y: 150,
      width: 35,
      height: 35,
      rotation: 180,
      color: '#FFD700',
      opacity: 0.8,
      zIndex: 3,
    },
    {
      iconType: 'spotlight',
      name: 'Stage Light Right',
      description: 'Main stage lighting',
      x: 540,
      y: 150,
      width: 35,
      height: 35,
      rotation: 180,
      color: '#FFD700',
      opacity: 0.8,
      zIndex: 3,
    },
    // Equipment storage
    {
      iconType: 'container',
      name: 'Equipment Storage',
      description: 'Backup equipment and supplies',
      x: 150,
      y: 200,
      width: 60,
      height: 50,
      rotation: 0,
      color: '#708090',
      opacity: 1.0,
      zIndex: 1,
    },
    // Info booth
    {
      iconType: 'desk',
      name: 'Information Desk',
      description: 'Guest check-in and information',
      x: 700,
      y: 200,
      width: 80,
      height: 50,
      rotation: 0,
      color: '#4682B4',
      opacity: 1.0,
      zIndex: 1,
    },
    // Markers for special areas
    {
      iconType: 'pin',
      name: 'Entrance',
      description: 'Main entrance to event area',
      x: 850,
      y: 150,
      width: 30,
      height: 40,
      rotation: 0,
      color: '#FF0000',
      opacity: 1.0,
      zIndex: 4,
    },
    {
      iconType: 'people',
      name: 'Dance Floor',
      description: 'Open area for dancing in front of stage',
      x: 450,
      y: 320,
      width: 60,
      height: 60,
      rotation: 0,
      color: '#9370DB',
      opacity: 0.6,
      zIndex: 0,
    },
    // WiFi router
    {
      iconType: 'wifi',
      name: 'WiFi Access Point',
      description: 'Wireless network for guests',
      x: 500,
      y: 150,
      width: 35,
      height: 35,
      rotation: 0,
      color: '#00CED1',
      opacity: 1.0,
      zIndex: 2,
    },
    // Bar area
    {
      iconType: 'table',
      name: 'Bar',
      description: 'Refreshment and beverage station',
      x: 200,
      y: 500,
      width: 100,
      height: 50,
      rotation: 0,
      color: '#D2691E',
      opacity: 1.0,
      zIndex: 1,
    },
    // Food area
    {
      iconType: 'table',
      name: 'Food Station',
      description: 'Buffet and catering area',
      x: 650,
      y: 500,
      width: 100,
      height: 50,
      rotation: 0,
      color: '#D2691E',
      opacity: 1.0,
      zIndex: 1,
    },
    // Additional seating
    {
      iconType: 'sofa',
      name: 'Lounge Seating 1',
      description: 'Casual seating area',
      x: 150,
      y: 400,
      width: 80,
      height: 40,
      rotation: 0,
      color: '#8B7355',
      opacity: 1.0,
      zIndex: 1,
    },
    {
      iconType: 'sofa',
      name: 'Lounge Seating 2',
      description: 'Casual seating area',
      x: 750,
      y: 400,
      width: 80,
      height: 40,
      rotation: 0,
      color: '#8B7355',
      opacity: 1.0,
      zIndex: 1,
    },
  ];

  console.log(`Creating ${items.length} example items...`);

  for (const itemData of items) {
    await prisma.diagramItem.create({
      data: {
        ...itemData,
        diagramId: diagram.id,
      },
    });
  }

  console.log(`✓ Created ${items.length} items`);
  console.log('\n✅ Example diagram created successfully!');
  console.log(`\nView it at: http://localhost:3000/diagrams/${diagram.id}`);
}

main()
  .catch((e) => {
    console.error('Error creating example diagram:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
