import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const jsonData = JSON.parse(fs.readFileSync("data.json", "utf-8"));

  const companyId = uuidv4();

  await prisma.company.create({
    data: {
      id: companyId,
      name: "Default Company",
      testingType: "Internal",
    },
  });

  const assetData = {
    title: jsonData.title,
    description: jsonData.description,
    ip: jsonData.ip,
    cveId: jsonData.cveId ? jsonData.cveId.split(",") : [],
    port: jsonData.port,
    riskLevel: jsonData.riskLevel,
    cvssScore: jsonData.cvssScore || null,
    impact: jsonData.impact,
    recommendations: jsonData.recommendations,
    reference: jsonData.references.length > 0 ? jsonData.references : [],
    companyId: companyId,
  };

  await prisma.asset.create({
    data: assetData,
  });

  console.log("Data imported successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
