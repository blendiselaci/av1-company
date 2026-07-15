-- AlterTable
ALTER TABLE "services" ADD COLUMN     "benefitsDe" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "benefitsEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "benefitsSq" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

