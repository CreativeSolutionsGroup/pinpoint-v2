# Map Component

A custom drag-and-drop mapping system for Pinpoint, allowing users to place icons onto campus maps to plan events.

## Features

- **Drag and Drop**: Drag icons from the palette onto the map or click to place at center
- **Icon Movement**: Click and drag icons on the map to reposition them
- **Zoom & Pan**: 
  - Scroll to zoom in/out (50% - 300%)
  - Shift+Drag or Middle-click to pan the map
  - Reset view button to return to original position
- **Icon Management**: 
  - Delete icons with the delete button (appears on hover)
  - Customizable icon colors and emojis
- **Search**: Filter available icons by name
- **Undo/Redo**: Track changes with undo/redo functionality (implemented in event page)

## Usage

### Basic Usage

```tsx
import { MapEditor } from "@/components/map";

export default function MyPage() {
  return (
    <MapEditor
      mapImageUrl="/path/to/your/campus-map.jpg"
    />
  );
}
```

### Advanced Usage with State Management

```tsx
"use client";

import { MapEditor } from "@/components/map";
import type { MapIconType } from "@/components/map";
import { useState } from "react";

export default function MyPage() {
  const [icons, setIcons] = useState<MapIconType[]>([]);

  const handleIconsChange = (newIcons: MapIconType[]) => {
    setIcons(newIcons);
    // Save to database, etc.
  };

  return (
    <MapEditor
      mapImageUrl="/path/to/your/campus-map.jpg"
      initialIcons={icons}
      onIconsChange={handleIconsChange}
    />
  );
}
```

### Custom Icon Types

```tsx
import { MapEditor } from "@/components/map";
import type { IconType } from "@/components/map";

const customIcons: IconType[] = [
  { type: "custom", label: "Custom Icon", icon: "🎯", color: "#ff6b6b" },
  { type: "special", label: "Special", icon: "⭐", color: "#4ecdc4" },
];

export default function MyPage() {
  return (
    <MapEditor
      mapImageUrl="/path/to/your/campus-map.jpg"
      availableIconTypes={customIcons}
    />
  );
}
```

## Components

### MapEditor
Main component that combines the canvas and icon palette.

**Props:**
- `mapImageUrl` (string, optional): URL of the map image
- `initialIcons` (MapIconType[], optional): Initial icons to display
- `availableIconTypes` (IconType[], optional): Custom icon types for the palette
- `onIconsChange` ((icons: MapIconType[]) => void, optional): Callback when icons change

### MapCanvas
The canvas where the map and icons are displayed.

### IconPalette
Sidebar showing available icons to place on the map.

### MapIcon
Individual icon component on the map.

## Types

```typescript
interface Position {
  x: number;  // Percentage (0-100)
  y: number;  // Percentage (0-100)
}

interface MapIcon {
  id: string;
  type: string;
  label: string;
  position: Position;
  icon: string;  // Emoji or unicode character
  color?: string;
}

interface IconType {
  type: string;
  label: string;
  icon: string;
  color?: string;
}
```

## Default Icons

The component comes with 16 pre-configured icon types:
- Stage 🎭
- Seating 🪑
- Food Stand 🍔
- Drinks 🥤
- Restroom 🚻
- Entrance 🚪
- Exit 🚪
- Parking 🅿️
- Info Booth ℹ️
- First Aid ⚕️
- Speaker 🔊
- Photo Spot 📸
- Merchandise 🛍️
- Registration 📝
- Security 🛡️
- WiFi Zone 📶

## Controls

- **Drag from Palette**: Drag an icon from the left sidebar onto the map
- **Click Icon in Palette**: Places icon at center of map
- **Drag Icon on Map**: Move a placed icon
- **Hover + Delete Button**: Remove an icon
- **Scroll Wheel**: Zoom in/out
- **Shift + Drag** or **Middle Mouse**: Pan the map
- **Zoom Buttons**: +/- buttons in top right
- **Reset View**: Return to original zoom and position

## Integration with Event Page

The map is integrated into the event page with:
- Multiple location tabs
- Undo/Redo functionality
- State management for icon positions
- Persistent icon placement across sessions (when connected to backend)

## Future Enhancements

- Save map configurations to database
- Share maps between users
- Export map as image
- Custom icon uploads
- Icon grouping and layers
- Measurement tools
- Grid snapping
- Keyboard shortcuts
