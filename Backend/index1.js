import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const results = [];
  const dataAssests = [];
  let companyData = null;

  fs.createReadStream("Shriram.csv")
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      const companyId = uuidv4();

      // Prepare the company data
      companyData = {
        id: companyId,
        name: "Shriram Piston",
        testingType: "Internal",
      };

      // Process each item and prepare for asset insertion
      for (const item of results) {
        // Collect processed asset data
        dataAssests.push({
          title: item["Vulnerability Title"],
          description: item.Description.replace(/\n/g," "),
          ip: item["IP"],
          cveId: item["CVE-ID"] || null,
          port: parseInt(item.Port, 10),
          riskLevel: mapRiskLevel(item["Risk-Level"]),
          cvssScore: parseFloat(item["CVSS-Base-Score"]) || null,
          impact: item.Impact.replace(/\n/g," "),
          recommendations: item.Solutions.replace(/\n/g," "),
          reference: item.Reference ? item.Reference.split("\n"): [],
          companyId: companyId,
        });
      }
      //Bulk insert the company
      await prisma.company.create({
        data: companyData,
      });
      //
      //Bulk insert assets after all data processing is done
      await prisma.asset.createMany({
        data: dataAssests,
      });

      //console.log("Company data", companyData);
      //console.log("Result Array", dataAssests);

      console.log("Data imported successfully!");
    });
}

function mapRiskLevel(riskRating) {
  switch (riskRating) {
    case "None":
      return 0;
    case "Low":
      return 1;
    case "Medium":
      return 2;
    case "High":
      return 3;
    case "Critical":
      return 4;
    default:
      return null;
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
