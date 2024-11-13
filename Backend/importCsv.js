import fs from "fs";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateHash(companyId, ...fields) {
  return crypto.createHash("md5").update([companyId, ...fields].join("|")).digest("hex");
}

export async function importCsv(filepath, quarterValue, companyName) {
  try {
    const results = [];

    // Step 1: Read and parse the CSV file into an array of objects
    fs.createReadStream(filepath)
      .pipe(csv({ separator: ";" }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        // Step 2: Fetch or create the company
        const company = await prisma.company.upsert({
          where: { name: companyName },
          update: {},
          create: { id: uuidv4(), name: companyName },
        });
        const companyId = company.id;

        // Step 3: Prepare CSV vulnerabilities data and calculate unique hashes
        const csvVulnMap = new Map();
        results.forEach((row) => {
          const uniqueHash = generateHash(
            companyId,
            row["Vulnerability Title"],
            row["CVE-ID"],
            row["IP"],
            row["Port"],
            row["Description"],
            row["CVSS-Base-Score"],
            row["Impact"],
            row["Solutions"]
          );

          csvVulnMap.set(uniqueHash, {
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
        });

        const csvHashes = Array.from(csvVulnMap.keys());

        // Step 4: Pull existing vulnerabilities from DB based on the CSV hashes
        const existingVulnerabilities = await prisma.vulnerability.findMany({
          where: {
            companyId: companyId,
            uniqueHash: { in: csvHashes },
          },
        });

        // Step 5: Update quarters for existing vulnerabilities
        const updatePromises = existingVulnerabilities.map((vuln) => {
          const csvVuln = csvVulnMap.get(vuln.uniqueHash);
          const updatedQuarters = Array.from(new Set([...vuln.quarter, ...csvVuln.quarter]));

          csvVulnMap.delete(vuln.uniqueHash); // Remove from CSV map once processed

          return prisma.vulnerability.update({
            where: { id: vuln.id },
            data: {
              isResolved: false,
              quarter: updatedQuarters,
              updatedAt: new Date(),
            },
          });
        });

        await Promise.all(updatePromises);

        // Step 6: Pull vulnerabilities unique to DB (not in CSV) and mark them as resolved
        const uniqueInDb = await prisma.vulnerability.findMany({
          where: {
            companyId: companyId,
            uniqueHash: { notIn: csvHashes },
          },
        });

        const resolvePromises = uniqueInDb.map((vuln) =>
          prisma.vulnerability.update({
            where: { id: vuln.id },
            data: { isResolved: true },
          })
        );

        await Promise.all(resolvePromises);

        // Step 7: Insert new vulnerabilities from CSV
        const newVulnerabilities = Array.from(csvVulnMap.values());
        if (newVulnerabilities.length > 0) {
          await prisma.vulnerability.createMany({
            data: newVulnerabilities,
            skipDuplicates: true,
          });
        }

        console.log("Vulnerabilities imported/updated successfully.");
      });
  } catch (error) {
    console.error("Error importing vulnerabilities:", error);
  } finally {
    await prisma.$disconnect();
  }
}
