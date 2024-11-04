/*
  Warnings:

  - The `cveId` column on the `Vulnerability` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Vulnerability" DROP COLUMN "cveId",
ADD COLUMN     "cveId" TEXT[];
