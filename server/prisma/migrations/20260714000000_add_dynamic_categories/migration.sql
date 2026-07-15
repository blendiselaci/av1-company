-- DropIndex
DROP INDEX "before_after_projects_category_isPublished_idx";

-- DropIndex
DROP INDEX "gallery_images_category_isPublished_idx";

-- DropIndex
DROP INDEX "projects_category_isPublished_idx";

-- DropIndex
DROP INDEX "videos_category_isPublished_idx";

-- AlterTable
ALTER TABLE "before_after_projects" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "gallery_images" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "category" DROP NOT NULL;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "nameSq" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameDe" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_isActive_order_idx" ON "categories"("isActive", "order");

-- CreateIndex
CREATE INDEX "before_after_projects_categoryId_isPublished_idx" ON "before_after_projects"("categoryId", "isPublished");

-- CreateIndex
CREATE INDEX "gallery_images_categoryId_isPublished_idx" ON "gallery_images"("categoryId", "isPublished");

-- CreateIndex
CREATE INDEX "projects_categoryId_isPublished_idx" ON "projects"("categoryId", "isPublished");

-- CreateIndex
CREATE INDEX "videos_categoryId_isPublished_idx" ON "videos"("categoryId", "isPublished");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "before_after_projects" ADD CONSTRAINT "before_after_projects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

