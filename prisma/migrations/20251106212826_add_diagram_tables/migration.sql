-- CreateTable
CREATE TABLE "Diagram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageWidth" DOUBLE PRECISION NOT NULL,
    "imageHeight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT,

    CONSTRAINT "Diagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagramItem" (
    "id" TEXT NOT NULL,
    "diagramId" TEXT NOT NULL,
    "iconType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#000000',
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagramItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Diagram_userId_idx" ON "Diagram"("userId");

-- CreateIndex
CREATE INDEX "Diagram_eventId_idx" ON "Diagram"("eventId");

-- CreateIndex
CREATE INDEX "DiagramItem_diagramId_idx" ON "DiagramItem"("diagramId");

-- AddForeignKey
ALTER TABLE "DiagramItem" ADD CONSTRAINT "DiagramItem_diagramId_fkey" FOREIGN KEY ("diagramId") REFERENCES "Diagram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
