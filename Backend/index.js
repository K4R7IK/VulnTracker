import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  // Read the JSON file
  const jsonData = JSON.parse(fs.readFileSync("data.json", "utf-8"));

  // Prepare to hold the company and asset data
  const companyId = uuidv4(); // Generate a new UUID for the company

  // Create the company in the database
  await prisma.company.create({
    data: {
      id: companyId,
      name: "Default Company", // Use a default name for the company
      testingType: "Internal", // Default testing type
    },
  });

  // Prepare asset data from JSON
  const assetData = {
    title: jsonData.title,
    description: jsonData.description, // Keep as an array
    ip: jsonData.ip,
    cveId: jsonData.cveId ? jsonData.cveId.split(",") : [], // Split if multiple CVE IDs
    port: jsonData.port,
    riskLevel: jsonData.riskLevel, // Assuming riskLevel is already an integer
    cvssScore: jsonData.cvssScore || null,
    impact: jsonData.impact, // Keep as an array
    recommendations: jsonData.recommendations, // Keep as an array
    reference: jsonData.references.length > 0 ? jsonData.references : [], // Directly use the references array
    companyId: companyId,
  };

  // Create asset in the database
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
