import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

async function seedAdmin(prisma: PrismaClient) {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists, skipping.`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: { name: "Initial Admin", email, passwordHash, role: "ADMIN" },
  });
  console.log(`Created initial admin user: ${email} (change the password after first login)`);
  return admin;
}

/**
 * Reference/demo data so the frontend's dropdowns and forms have something real to work
 * against. Formulation numbers are illustrative (in the right ballpark for MS-based media)
 * but not a validated protocol — don't use this recipe to actually prep media.
 */
async function seedReferenceData(prisma: PrismaClient, adminId: string) {
  if ((await prisma.location.count()) > 0) {
    console.log("Locations already seeded, skipping reference data.");
    return;
  }

  const cleanroom = await prisma.location.create({ data: { name: "Cleanroom A", type: "CLEANROOM" } });
  await Promise.all([
    prisma.location.create({ data: { name: "Growth Room 1", type: "GROWTH_ROOM" } }),
    prisma.location.create({ data: { name: "Greenhouse 1", type: "GREENHOUSE" } }),
    prisma.location.create({ data: { name: "Cold Storage", type: "STORAGE" } }),
  ]);
  console.log("Seeded 4 locations.");

  await prisma.plantSpecies.createMany({
    data: [
      { name: "Banana", scientificName: "Musa acuminata" },
      { name: "Dendrobium Orchid", scientificName: "Dendrobium hybrid" },
      { name: "Vanilla", scientificName: "Vanilla planifolia" },
      { name: "Potato", scientificName: "Solanum tuberosum" },
    ],
  });
  console.log("Seeded 4 plant species.");

  await prisma.workstation.createMany({
    data: [
      { name: "Hood 1", locationId: cleanroom.id, hoodType: "Class II BSC" },
      { name: "Hood 2", locationId: cleanroom.id, hoodType: "Class II BSC" },
    ],
  });
  console.log("Seeded 2 workstations.");

  const [msSalts, sucrose, agar, bap, naa, thiamine] = await Promise.all([
    prisma.chemical.create({
      data: {
        name: "MS Basal Salts (10x)",
        category: "MACRO_SALT",
        stockConcentration: 43.4,
        unit: "g/L",
        currentStockQty: 2000,
        reorderThreshold: 500,
        supplier: "Sigma-Aldrich",
      },
    }),
    prisma.chemical.create({
      data: {
        name: "Sucrose",
        category: "SUGAR",
        stockConcentration: 300,
        unit: "g/L",
        currentStockQty: 4000,
        reorderThreshold: 1000,
        supplier: "Fisher Scientific",
      },
    }),
    prisma.chemical.create({
      data: {
        name: "Agar",
        category: "GELLING_AGENT",
        stockConcentration: 80,
        unit: "g/L",
        currentStockQty: 3000,
        reorderThreshold: 500,
        supplier: "Fisher Scientific",
      },
    }),
    prisma.chemical.create({
      data: {
        name: "BAP (6-Benzylaminopurine)",
        category: "PGR",
        stockConcentration: 1,
        unit: "mg/mL",
        currentStockQty: 300,
        reorderThreshold: 50,
        supplier: "Sigma-Aldrich",
      },
    }),
    prisma.chemical.create({
      data: {
        name: "NAA (Naphthaleneacetic acid)",
        category: "PGR",
        stockConcentration: 1,
        unit: "mg/mL",
        currentStockQty: 300,
        reorderThreshold: 50,
        supplier: "Sigma-Aldrich",
      },
    }),
    prisma.chemical.create({
      data: {
        name: "Thiamine HCl",
        category: "VITAMIN",
        stockConcentration: 1,
        unit: "mg/mL",
        currentStockQty: 250,
        reorderThreshold: 50,
        supplier: "Sigma-Aldrich",
      },
    }),
  ]);
  console.log("Seeded 6 chemicals.");

  await prisma.mediaRecipe.create({
    data: {
      name: "MS Multiplication Medium",
      basalMediaType: "MS",
      targetPh: 5.8,
      gellingAgentId: agar.id,
      createdById: adminId,
      components: {
        create: [
          { chemicalId: msSalts.id, concentration: 4.34, unit: "g/L" },
          { chemicalId: sucrose.id, concentration: 30, unit: "g/L" },
          { chemicalId: agar.id, concentration: 8, unit: "g/L" },
          { chemicalId: bap.id, concentration: 1.0, unit: "mg/L" },
          { chemicalId: naa.id, concentration: 0.1, unit: "mg/L" },
          { chemicalId: thiamine.id, concentration: 0.1, unit: "mg/L" },
        ],
      },
    },
  });
  console.log("Seeded 1 media recipe (MS Multiplication Medium).");
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const admin = await seedAdmin(prisma);
  await seedReferenceData(prisma, admin.id);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
