/**
 * Example Prisma schema for storing Pinpoint map data
 * Add these models to your prisma/schema.prisma file
 */

/*
model Event {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  locations   EventLocation[]
  createdBy   String   // User ID from Stack Auth
}

model EventLocation {
  id          String   @id @default(cuid())
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventId     String
  name        String
  mapImageUrl String
  icons       MapIcon[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MapIcon {
  id              String        @id @default(cuid())
  location        EventLocation @relation(fields: [locationId], references: [id], onDelete: Cascade)
  locationId      String
  type            String
  label           String
  icon            String        // Emoji or unicode character
  color           String?
  positionX       Float         // Percentage (0-100)
  positionY       Float         // Percentage (0-100)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
*/

/**
 * Example API routes for map data
 */

// GET /api/events/[id]/locations
export interface GetEventLocationsResponse {
  locations: {
    id: string;
    name: string;
    mapImageUrl: string;
    icons: {
      id: string;
      type: string;
      label: string;
      icon: string;
      color?: string;
      position: {
        x: number;
        y: number;
      };
    }[];
  }[];
}

// POST /api/events/[id]/locations
export interface CreateLocationRequest {
  name: string;
  mapImageUrl: string;
}

// PUT /api/locations/[id]/icons
export interface UpdateLocationIconsRequest {
  icons: {
    id?: string; // Omit for new icons
    type: string;
    label: string;
    icon: string;
    color?: string;
    position: {
      x: number;
      y: number;
    };
  }[];
}

/**
 * Example usage in a page component
 */

/*
"use client";

import { MapEditor } from "@/components/map";
import type { MapIconType } from "@/components/map";
import { useState, useEffect } from "react";

export default function EventPage({ params }: { params: { id: string } }) {
  const [icons, setIcons] = useState<MapIconType[]>([]);
  const [mapImageUrl, setMapImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // Load icons from database
  useEffect(() => {
    async function loadLocation() {
      const res = await fetch(`/api/events/${params.id}/locations`);
      const data = await res.json();
      if (data.locations[0]) {
        setMapImageUrl(data.locations[0].mapImageUrl);
        setIcons(data.locations[0].icons);
      }
      setLoading(false);
    }
    loadLocation();
  }, [params.id]);

  // Save icons to database
  const handleIconsChange = async (newIcons: MapIconType[]) => {
    setIcons(newIcons);
    
    // Debounce or save on explicit action
    await fetch(`/api/locations/${locationId}/icons`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icons: newIcons }),
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <MapEditor
      mapImageUrl={mapImageUrl}
      initialIcons={icons}
      onIconsChange={handleIconsChange}
    />
  );
}
*/
