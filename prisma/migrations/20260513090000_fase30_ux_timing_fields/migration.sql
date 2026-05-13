-- AlterTable
ALTER TABLE "empreendimentos" ADD COLUMN "logoDisplayDurationSeconds" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN "homeCarouselIntervalSeconds" INTEGER NOT NULL DEFAULT 5;
