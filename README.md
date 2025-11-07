# Pinpoint v2

Pinpoint is a custom mapping software that allows users to place icons onto maps of college campus to plan events. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🗺️ Interactive Mapping
- **Drag and Drop Interface**: Easily place event icons on campus maps
- **Zoom & Pan Controls**: Navigate large maps with mouse controls
- **Custom Icon Palette**: 16+ pre-configured event icons (stage, seating, food, parking, etc.)
- **Real-time Updates**: Icons update immediately as you place and move them
- **Undo/Redo**: Full history tracking for all map changes

### 📍 Event Planning
- **Multi-location Support**: Create events across multiple campus locations
- **Icon Customization**: Choose from emoji-based icons with custom colors
- **Search Functionality**: Quickly find the icons you need
- **Delete on Hover**: Easy icon removal

## Quick Start

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
app/
  ├── page.tsx              # Home page with event selection
  ├── event/[id]/page.tsx   # Event detail page with map editor
  └── map-demo/page.tsx     # Standalone map demo
components/
  ├── map/                  # Map component system
  │   ├── map-editor.tsx    # Main editor component
  │   ├── map-canvas.tsx    # Canvas with zoom/pan
  │   ├── icon-palette.tsx  # Icon selection sidebar
  │   ├── map-icon.tsx      # Individual draggable icons
  │   └── types.ts          # TypeScript definitions
  └── ui/                   # Shadcn UI components
```

## Map Component Usage

### Basic Usage
```tsx
import { MapEditor } from "@/components/map";

export default function MyPage() {
  return <MapEditor mapImageUrl="/path/to/map.jpg" />;
}
```

### With State Management
```tsx
"use client";

import { MapEditor } from "@/components/map";
import type { MapIconType } from "@/components/map";
import { useState } from "react";

export default function MyPage() {
  const [icons, setIcons] = useState<MapIconType[]>([]);

  return (
    <MapEditor
      mapImageUrl="/path/to/map.jpg"
      initialIcons={icons}
      onIconsChange={setIcons}
    />
  );
}
```

See [`components/map/README.md`](./components/map/README.md) for detailed documentation.

## Pages

- **`/`** - Home page with event carousel and grid
- **`/event/[id]`** - Event planning page with map editor
- **`/map-demo`** - Standalone map demo for testing

## Map Controls

- **Drag from Palette** → Place icon on map
- **Click in Palette** → Place icon at center
- **Drag Icon** → Move icon
- **Hover + Delete** → Remove icon
- **Scroll** → Zoom in/out
- **Shift+Drag** or **Middle-click** → Pan map
- **Reset Button** → Return to original view

## Tech Stack

- **Framework**: Next.js 15.5
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + Shadcn
- **Icons**: Lucide React
- **Database**: Prisma (configured)
- **Auth**: Stack Auth

## Development

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
