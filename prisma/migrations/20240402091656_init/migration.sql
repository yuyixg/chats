-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatModels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelVersion" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rank" INTEGER,
    "fileServerId" TEXT,
    "fileConfig" TEXT,
    "apiConfig" TEXT NOT NULL DEFAULT '{}',
    "modelConfig" TEXT NOT NULL DEFAULT '{}',
    "priceConfig" TEXT NOT NULL DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ChatModels" ("apiConfig", "createdAt", "enabled", "fileConfig", "fileServerId", "id", "modelConfig", "modelVersion", "name", "priceConfig", "rank", "type", "updatedAt") SELECT "apiConfig", "createdAt", "enabled", "fileConfig", "fileServerId", "id", "modelConfig", "modelVersion", "name", "priceConfig", "rank", "type", "updatedAt" FROM "ChatModels";
DROP TABLE "ChatModels";
ALTER TABLE "new_ChatModels" RENAME TO "ChatModels";
CREATE UNIQUE INDEX "ChatModels_name_key" ON "ChatModels"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
