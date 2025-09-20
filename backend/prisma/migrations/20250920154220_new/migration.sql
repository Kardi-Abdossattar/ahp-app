/*
  Warnings:

  - A unique constraint covering the columns `[projectId,criterionAId,criterionBId]` on the table `comparisons` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "comparisons_projectId_criterionAId_criterionBId_contextId_key";

-- CreateIndex
CREATE UNIQUE INDEX "comparisons_projectId_criterionAId_criterionBId_key" ON "comparisons"("projectId", "criterionAId", "criterionBId");
