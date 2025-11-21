/*
  Warnings:

  - You are about to drop the column `status` on the `reviews` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "review_helpful_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_helpful_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "review_helpful_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "admin_reply" TEXT,
    "admin_reply_at" DATETIME,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("comment", "created_at", "id", "images", "product_id", "rating", "updated_at", "user_id") SELECT "comment", "created_at", "id", "images", "product_id", "rating", "updated_at", "user_id" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "reviews_is_approved_idx" ON "reviews"("is_approved");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "review_helpful_votes_review_id_idx" ON "review_helpful_votes"("review_id");

-- CreateIndex
CREATE INDEX "review_helpful_votes_user_id_idx" ON "review_helpful_votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_helpful_votes_review_id_user_id_key" ON "review_helpful_votes"("review_id", "user_id");
