/*
  Warnings:

  - A unique constraint covering the columns `[companyId,uniqueHash]` on the table `Vulnerability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vulnerability_companyId_uniqueHash_key" ON "Vulnerability"("companyId", "uniqueHash");
