-- CreateTable
CREATE TABLE "WorkoutBlueprint" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "data" JSONB NOT NULL,
    "imports" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutBlueprint_code_key" ON "WorkoutBlueprint"("code");

-- CreateIndex
CREATE INDEX "WorkoutBlueprint_ownerId_idx" ON "WorkoutBlueprint"("ownerId");

-- AddForeignKey
ALTER TABLE "WorkoutBlueprint" ADD CONSTRAINT "WorkoutBlueprint_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
