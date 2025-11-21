/*
  Warnings:

  - You are about to drop the column `created_at` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `max_discount` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `min_purchase` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `usage_limit` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `used_count` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `coupons` table. All the data in the column will be lost.
  - Added the required column `discountType` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountValue` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_coupons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "minPurchase" REAL,
    "maxDiscount" REAL,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_coupons" ("code", "id") SELECT "code", "id" FROM "coupons";
DROP TABLE "coupons";
ALTER TABLE "new_coupons" RENAME TO "coupons";
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
