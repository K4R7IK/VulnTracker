-- CreateEnum
CREATE TYPE "TestingType" AS ENUM ('Internal', 'External', 'Both');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('None', 'Info', 'Low', 'Medium', 'High', 'Critical');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "testingType" "TestingType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "cveId" TEXT,
    "port" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "cvssScore" DOUBLE PRECISION,
    "impact" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "reference" TEXT[],
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
