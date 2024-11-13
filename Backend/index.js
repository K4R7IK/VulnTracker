import express from "express";
import multer from "multer";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { importCsv } from "./importCsv.js";

const app = express();
const upload = multer({ dest: "uploads/" });

const prisma = new PrismaClient();
// specify this later to a single frontend.
app.use(cors());
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  const { quarter, companyName } = req.body;
  const filepath = req.file.path;

  try {
    await importCsv(filepath, quarter, companyName);
    res.status(200).json({ message: "File processed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing file." });
  }
});

app.get("/companies", async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      select: { id: true, name: true },
    });
    res.status(200).json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching companies." });
  }
});

app.get("/vulnerabilities", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      companyId,
      quarter,
      isResolved,
      quarterNot,
    } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { assetIp: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(companyId && { companyId }),
      ...(quarter && { quarter: { has: quarter } }),
      ...(quarterNot && { NOT: { quarter: { has: quarterNot } } }),
      ...(isResolved !== undefined && { isResolved: isResolved === "true" }),
    };

    // Fetch vulnerabilities and total count
    const [vulnerabilities, total] = await Promise.all([
      prisma.vulnerability.findMany({
        where,
        include: { company: true },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.vulnerability.count({ where }),
    ]);

    res.status(200).json({
      data: vulnerabilities,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching vulnerabilities." });
  }
});

app.get("/quarters", async (req, res) => {
  try {
    const { companyId } = req.query;

    const quartersData = await prisma.vulnerability.findMany({
      where: companyId ? { companyId } : {},
      select: {
        quarter: true,
      },
    });

    const quarterSet = new Set();
    quartersData.forEach((vuln) => {
      vuln.quarter.forEach((q) => quarterSet.add(q));
    });

    const uniqueQuarters = Array.from(quarterSet);
    uniqueQuarters.sort(); // Optional sorting

    res.status(200).json(uniqueQuarters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching quarters." });
  }
});
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
