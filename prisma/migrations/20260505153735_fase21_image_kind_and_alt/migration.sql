-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_imagens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empreendimentoId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "altText" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'GALLERY',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "imagens_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "empreendimentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_imagens" ("caption", "createdAt", "empreendimentoId", "filePath", "id", "sortOrder", "title", "updatedAt") SELECT "caption", "createdAt", "empreendimentoId", "filePath", "id", "sortOrder", "title", "updatedAt" FROM "imagens";
DROP TABLE "imagens";
ALTER TABLE "new_imagens" RENAME TO "imagens";
CREATE INDEX "imagens_empreendimentoId_sortOrder_idx" ON "imagens"("empreendimentoId", "sortOrder");
CREATE INDEX "imagens_empreendimentoId_kind_sortOrder_idx" ON "imagens"("empreendimentoId", "kind", "sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
