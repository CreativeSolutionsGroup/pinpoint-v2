# Pinpoint Map Component - Quick Start Guide

## What I've Built

A complete custom drag-and-drop mapping system for Pinpoint that allows users to:
- Place icons on campus maps to plan events
- Zoom and pan to navigate large maps
- Drag icons to reposition them
- Delete icons with a simple hover action
- Search for specific icon types
- Track changes with undo/redo functionality

## Files Created

### Core Map Components (`/components/map/`)
1. **`types.ts`** - TypeScript definitions for map data structures
2. **`map-icon.tsx`** - Individual draggable icon component
3. **`icon-palette.tsx`** - Sidebar with searchable, draggable icons
4. **`map-canvas.tsx`** - Main canvas with zoom/pan and icon management
5. **`map-editor.tsx`** - Complete editor combining canvas and palette
6. **`index.ts`** - Public exports for easy importing
7. **`README.md`** - Detailed component documentation

### Pages
- **`/app/event/[id]/page.tsx`** - Updated with map editor integration
- **`/app/map-demo/page.tsx`** - Standalone demo page

### Documentation
- **`/README.md`** - Updated project README with map features

## Using the Map in Your Code

### Simple Usage (in any page)
```tsx
import { MapEditor } from "@/components/map";

export default function MyPage() {
  return (
    <div className="h-screen p-4">
      <MapEditor mapImageUrl="/your-campus-map.jpg" />
    </div>
  );
}
```

### With State Management (for saving)
```tsx
"use client";

import { MapEditor } from "@/components/map";
import type { MapIconType } from "@/components/map";
import { useState } from "react";

export default function MyPage() {
  const [icons, setIcons] = useState<MapIconType[]>([]);

  const handleSave = () => {
    // Send icons to your API/database
    console.log(icons);
  };

  return (
    <MapEditor
      mapImageUrl="/your-campus-map.jpg"
      initialIcons={icons}
      onIconsChange={setIcons}
    />
  );
}
```

## Testing the Map

1. **Run the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit these URLs:**
   - **Demo page**: http://localhost:3000/map-demo
   - **Event page**: http://localhost:3000/event/1

3. **Try these actions:**
   - Drag icons from the left palette onto the map
   - Click an icon in the palette to place it at the center
   - Drag icons on the map to reposition them
   - Hover over an icon and click the delete button
   - Use the search box to filter icons
   - Scroll to zoom in/out
   - Shift+drag to pan the map
   - Use undo/redo buttons (on event page)

## Default Icons Available

The component includes 16 pre-configured icon types:
- 🎭 Stage
- 🪑 Seating
- 🍔 Food Stand
- 🥤 Drinks
- 🚻 Restroom
- 🚪 Entrance/Exit
- 🅿️ Parking
- ℹ️ Info Booth
- ⚕️ First Aid
- 🔊 Speaker
- 📸 Photo Spot
- 🛍️ Merchandise
- 📝 Registration
- 🛡️ Security
- 📶 WiFi Zone

## Customizing Icons

To add your own icons, pass them to the `availableIconTypes` prop:

```tsx
import { MapEditor } from "@/components/map";
import type { IconType } from "@/components/map";

const myIcons: IconType[] = [
  { 
    type: "my-custom-icon", 
    label: "Custom", 
    icon: "🎯", 
    color: "#ff6b6b" 
  },
];

<MapEditor 
  mapImageUrl="/map.jpg"
  availableIconTypes={myIcons}
/>
```

## Map Controls Reference

| Action | Control |
|--------|---------|
| Place icon | Drag from palette or click icon |
| Move icon | Drag icon on map |
| Delete icon | Hover + click delete button |
| Zoom | Scroll wheel or +/- buttons |
| Pan | Shift+drag or middle-click |
| Reset view | Click maximize button |
| Search icons | Type in search box |

## Next Steps

1. **Add your campus maps**: Replace the placeholder image URLs with real campus map images
2. **Connect to database**: Use the `onIconsChange` callback to save icon positions
3. **Add authentication**: Integrate with the Stack Auth system already in your project
4. **Customize icons**: Add campus-specific icons for your use case
5. **Export feature**: Add ability to export maps as images

## Data Structure

Icons are stored as:
```typescript
{
  id: "unique-id",
  type: "stage",
  label: "Main Stage",
  icon: "🎭",
  color: "#ef4444",
  position: { x: 50, y: 50 }  // Percentages (0-100)
}
```

Position uses percentages so icons scale properly with different screen sizes.

## Need Help?

- See [`/components/map/README.md`](./components/map/README.md) for detailed API docs
- Check the demo page at `/map-demo` for a working example
- Look at `/app/event/[id]/page.tsx` for undo/redo implementation

Happy mapping! 🗺️
