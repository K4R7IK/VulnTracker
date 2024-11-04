import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateHash(...fields) {
  return crypto.createHash("md5").update(fields.join("|")).digest("hex");
}

async function importCsv(filepath, quarterValue, companyName) {
  const results = [];
  const vulnAsset = [];
  const csvVulnSet = new Set();

  fs.createReadStream(filepath)
    .pipe(csv({ separator: ";" }))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      let companyId;

      // Fetch or create company
      const existingCompany = await prisma.company.findUnique({
        where: { name: companyName },
      });

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const newCompany = await prisma.company.create({
          data: {
            id: uuidv4(),
            name: companyName,
          },
        });
        companyId = newCompany.id;
      }

      // Fetch existing vulnerabilities associated with the company
      const existingVulnerabilities = await prisma.vulnerability.findMany({
        where: {
          companyId: companyId,
        },
      });

      // Create a map for quick lookup of existing vulnerabilities
      const existingVulnMap = new Map();
      existingVulnerabilities.forEach((vuln) => {
        existingVulnMap.set(
          `${vuln.title}-${vuln.assetIp}-${vuln.port}`, // Unique key
          vuln,
        );
      });

      for (const row of results) {
        const vulnKey = `${row["Vulnerability Title"]}-${row["IP"]}-${parseInt(row["Port"], 10)}`;
        csvVulnSet.add(vulnKey);
        const existingVuln = existingVulnMap.get(vulnKey);

        if (existingVuln) {
          // Update `quarter` if vulnerability exists
          const updatedQuarters = Array.from(
            new Set([...existingVuln.quarter, quarterValue]),
          );

          await prisma.vulnerability.update({
            where: { id: existingVuln.id },
            data: {
              isResolved: false,
              quarter: updatedQuarters,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create a new vulnerability object if it doesn't exist
          const uniqueHash = generateHash(
            row["Vulnerability Title"],
            row["CVE-ID"],
            row["IP"],
            row["Port"],
            row["Description"],
            row["CVSS-Base-Score"],
            row["Impact"],
            row["Solutions"],
          );
          vulnAsset.push({
            id: uuidv4(),
            assetIp: row["IP"],
            assetOS: row["Asset OS"] || null,
            port: parseInt(row["Port"], 10),
            protocol: row["PROTOCOL"].toUpperCase() || "None",
            title: row["Vulnerability Title"],
            cveId: row["CVE-ID"] ? row["CVE-ID"].split("\n") : [],
            description: row["Description"].replace(/\n/g, " "),
            riskLevel: row["Risk-Level"] || "None",
            cvssScore: parseFloat(row["CVSS-Base-Score"]) || 0,
            impact: row["Impact"],
            recommendations: row["Solutions"],
            references: row["Reference"] ? row["Reference"].split(" ") : [],
            quarter: [quarterValue],
            uniqueHash: uniqueHash,
            companyId: companyId,
            isResolved: false,
          });
        }
      }

      const dbVulnKey = Array.from(existingVulnMap.keys());
      const missingInCsvKey = dbVulnKey.filter((key) => !csvVulnSet.has(key));

      if (missingInCsvKey.length > 0) {
        const missingIds = missingInCsvKey.map(
          (key) => existingVulnMap.get(key).id,
        );
        await prisma.vulnerability.updateMany({
          where: { id: { in: missingIds } },
          data: { isResolved: true },
        });
      }

      // Insert new vulnerabilities in batch
      if (vulnAsset.length > 0) {
        await prisma.vulnerability.createMany({
          data: vulnAsset,
        });
      }

      console.log("Vulnerabilities imported/updated successfully.");
    });
}

importCsv("Shriram.csv", "Q1", "Shriram Piston")
  //importCsv("Shriram2.csv", "Q2", "Shriram Piston")
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
