/*
  Warnings:

  - A unique constraint covering the columns `[uniqueHash]` on the table `Vulnerability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueHash` to the `Vulnerability` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Vulnerability_title_cveId_assetIp_port_description_cvssScor_key";

-- AlterTable
ALTER TABLE "Vulnerability" ADD COLUMN     "uniqueHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vulnerability_uniqueHash_key" ON "Vulnerability"("uniqueHash");
