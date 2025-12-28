import { PrismaClient, RoomTypeEnum} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding room types...');
  
  const roomTypes = [
    { nom_type: RoomTypeEnum.SINGLE, description: 'Single bed room' },
    { nom_type: RoomTypeEnum.DOUBLE, description: 'Double bed room' },
    { nom_type: RoomTypeEnum.SUITE, description: 'Luxury suite' },
  ];

  for (const roomType of roomTypes) {
    await prisma.roomType.upsert({
      where: { nom_type: roomType.nom_type },
      update: {},
      create: roomType,
    });
    console.log(`Created/Updated room type: ${roomType.nom_type}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });