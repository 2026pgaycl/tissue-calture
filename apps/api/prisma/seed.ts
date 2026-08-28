import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

async function seedOrganization(prisma: PrismaClient) {
  const slug = process.env.SEED_ORG_SLUG ?? "default-lab";
  const name = process.env.SEED_ORG_NAME ?? "Default Lab";

  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    console.log(`Organization "${existing.name}" already exists, skipping.`);
    return existing;
  }

  const org = await prisma.organization.create({ data: { name, slug } });
  console.log(`Created organization: ${org.name} (${org.slug})`);
  return org;
}

async function seedAdmin(prisma: PrismaClient, organizationId: string) {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user ${email} already exists, skipping.`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: { organizationId, name: "Initial Admin", email, passwordHash, role: "ADMIN" },
  });
  console.log(`Created initial admin user: ${email} (change the password after first login)`);
  return admin;
}

/**
 * Reference/demo data so the frontend's dropdowns and forms have something real to work
 * against. Formulation numbers are illustrative (in the right ballpark for MS-based media)
 * but not a validated protocol — don't use this recipe to actually prep media.
 */
async function seedReferenceData(prisma: PrismaClient, organizationId: string, adminId: string) {
  if ((await prisma.location.count({ where: { organizationId } })) > 0) {
    console.log("Locations already seeded, skipping reference data.");
    return;
  }

  const cleanroom = await prisma.location.create({
    data: { organizationId, name: "Cleanroom A", type: "CLEANROOM" },
  });
  await Promise.all([
    prisma.location.create({ data: { organizationId, name: "Growth Room 1", type: "GROWTH_ROOM" } }),
    prisma.location.create({ data: { organizationId, name: "Greenhouse 1", type: "GREENHOUSE" } }),
    prisma.location.create({ data: { organizationId, name: "Cold Storage", type: "STORAGE" } }),
  ]);
  console.log("Seeded 4 locations.");

  await prisma.plantSpecies.createMany({
    data: [
      { organizationId, name: "Banana", scientificName: "Musa acuminata" },
      { organizationId, name: "Dendrobium Orchid", scientificName: "Dendrobium hybrid" },
      { organizationId, name: "Vanilla", scientificName: "Vanilla planifolia" },
      { organizationId, name: "Potato", scientificName: "Solanum tuberosum" },
    ],
  });
  console.log("Seeded 4 plant species.");

  await prisma.workstation.createMany({
    data: [
      { organizationId, name: "Hood 1", locationId: cleanroom.id, hoodType: "Class II BSC" },
      { organizationId, name: "Hood 2", locationId: cleanroom.id, hoodType: "Class II BSC" },
    ],
  });
  console.log("Seeded 2 workstations.");

  const [msSalts, sucrose, agar, bap, naa, thiamine] = await Promise.all([
    prisma.chemical.create({
      data: {
        organizationId,
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
        organizationId,
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
        organizationId,
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
        organizationId,
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
        organizationId,
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
        organizationId,
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
      organizationId,
      name: "MS Multiplication Medium",
      basalMediaType: "MS",
      targetPh: 5.8,
      gellingAgentId: agar.id,
      createdById: adminId,
      components: {
        create: [
          { organizationId, chemicalId: msSalts.id, concentration: 4.34, unit: "g/L" },
          { organizationId, chemicalId: sucrose.id, concentration: 30, unit: "g/L" },
          { organizationId, chemicalId: agar.id, concentration: 8, unit: "g/L" },
          { organizationId, chemicalId: bap.id, concentration: 1.0, unit: "mg/L" },
          { organizationId, chemicalId: naa.id, concentration: 0.1, unit: "mg/L" },
          { organizationId, chemicalId: thiamine.id, concentration: 0.1, unit: "mg/L" },
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

  const org = await seedOrganization(prisma);
  const admin = await seedAdmin(prisma, org.id);
  await seedReferenceData(prisma, org.id, admin.id);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
