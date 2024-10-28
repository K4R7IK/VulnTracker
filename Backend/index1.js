import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const results = [];
  const assetsToInsert = [];
  let companyData = null;

  fs.createReadStream("data.csv")
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const companyId = uuidv4();

      // Prepare the company data
      companyData = {
        id: companyId,
        name: "Test Company",
        testingType: "Internal",
      };

      // Process each item and prepare for asset insertion
      for (const item of results) {
        const riskLevelMapping = {
          None: "None",
          Info: "Info",
          Low: "Low",
          Medium: "Medium",
          High: "High",
          Critical: "Critical",
        };

        const riskLevelValue =
          riskLevelMapping[item["Risk Rating"]?.trim()] || "None"; // Default to "None" if invalid

        // Collect processed asset data
        assetsToInsert.push({
          title: item["Vulnerability Title"],
          description: item.Description,
          ip: item["Impacted IP/URL"],
          cveId: item["CVE-ID"] || null,
          port: parseInt(item.Port, 10),
          riskLevel: riskLevelValue, // Set riskLevel using mapped value
          cvssScore: parseFloat(item["CVSS v2.0 Base Score"]) || null,
          impact: item.Impact,
          recommendations: item.Solutions,
          reference: item.Reference ? item.Reference.split(",") : [],
          companyId: companyId,
        });
      }

      // Bulk insert the company
      await prisma.company.create({
        data: companyData,
      });

      // Bulk insert assets after all data processing is done
      await prisma.asset.createMany({
        data: assetsToInsert,
      });

      console.log("Data imported successfully!");
    });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
