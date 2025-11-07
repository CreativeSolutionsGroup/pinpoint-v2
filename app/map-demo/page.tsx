"use client";

import { MapEditor } from "@/components/map";

export default function MapDemo() {
  return (
    <div className="h-screen p-4">
      <div className="h-full flex flex-col gap-4">
        <div className="bg-muted rounded-lg px-4 py-3">
          <h1 className="text-2xl font-bold">Pinpoint Map Demo</h1>
          <p className="text-sm text-muted-foreground">
            Drag icons from the left palette onto the map, or click them to place at center
          </p>
        </div>
        <div className="flex-1">
          <MapEditor
            mapImageUrl="https://placehold.co/1600x1200/1e293b/94a3b8?text=Campus+Map+Demo"
          />
        </div>
      </div>
    </div>
  );
}
