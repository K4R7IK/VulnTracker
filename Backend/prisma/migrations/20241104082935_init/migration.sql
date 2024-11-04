-- CreateEnum
CREATE TYPE "TestingType" AS ENUM ('Internal', 'External', 'Both');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('None', 'Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "ProtocolType" AS ENUM ('TCP', 'UDP', 'None');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vulnerability" (
    "id" TEXT NOT NULL,
    "assetIp" TEXT NOT NULL,
    "assetOS" TEXT,
    "port" INTEGER NOT NULL,
    "protocol" "ProtocolType" NOT NULL,
    "title" TEXT NOT NULL,
    "cveId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "cvssScore" DOUBLE PRECISION,
    "impact" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "references" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vulnerability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vulnerability_title_cveId_assetIp_port_description_cvssScor_key" ON "Vulnerability"("title", "cveId", "assetIp", "port", "description", "cvssScore", "impact", "recommendations");

-- AddForeignKey
ALTER TABLE "Vulnerability" ADD CONSTRAINT "Vulnerability_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
