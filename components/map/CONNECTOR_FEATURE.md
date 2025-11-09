# Map Connector Feature

This document describes the connector feature that allows drawing lines between icons on the map.

## Overview

The connector feature enables users to create visual connections between map icons, useful for showing:
- Pathways between locations
- Relationships between facilities
- Flow diagrams
- Network connections

## Components

### `Connector` Type
Defined in `types.ts`:
```typescript
interface Connector {
  id: string;
  startIconId: string;
  endIconId: string;
  color?: string;
  width?: number; // Line width in pixels (default 2)
  style?: ConnectorStyle; // "solid" | "dashed" | "dotted"
  label?: string;
  description?: string;
}
```

### `MapConnector` Component
Renders a single connector as an SVG line between two icons. Features:
- Hover detection for editing
- Visual styling (color, width, line style)
- Optional labels at midpoint
- Edit menu on hover

### `ConnectorEditMenu` Component
Provides UI for editing connector properties:
- Label and description
- Color selection (8 preset colors)
- Line style (solid, dashed, dotted)
- Width adjustment (1-10px)
- Delete functionality

## Usage

### Creating Connectors

1. Click the **Link** button in the map controls (top-right)
2. Click on the first icon you want to connect
3. Click on the second icon to create the connector
4. The connection is created automatically

**Tips:**
- Icons show a ring highlight on hover in connect mode
- The selected start icon shows a pulsing animation and thicker border
- Click the same icon again to cancel selection
- Click the Link button again to exit connect mode

### Editing Connectors

1. Hover over any connector line
2. Click the edit button that appears at the midpoint
3. Modify properties in the popup menu:
   - **Label**: Text displayed at the connector midpoint
   - **Description**: Additional notes (not displayed visually)
   - **Color**: Choose from preset colors
   - **Line Style**: Solid, dashed, or dotted
   - **Width**: Adjust line thickness with slider
4. Changes are saved automatically

### Deleting Connectors

Two ways to delete:
1. Use the "Delete Connector" button in the edit menu
2. Delete an icon - all connected connectors are automatically removed

## Integration

### In MapEditor

```tsx
<MapEditor
  mapImageUrl="/path/to/map.jpg"
  initialIcons={icons}
  initialConnectors={connectors}
  onIconsChange={handleIconsChange}
  onConnectorsChange={handleConnectorsChange}
  onIconMoveComplete={handleIconMoveComplete}
  onConnectorMoveComplete={handleConnectorMoveComplete}
/>
```

### In MapCanvas (direct usage)

```tsx
<MapCanvas
  mapImageUrl="/path/to/map.jpg"
  icons={icons}
  connectors={connectors}
  onIconsChange={handleIconsChange}
  onConnectorsChange={handleConnectorsChange}
  onIconMoveComplete={handleIconMoveComplete}
  onConnectorMoveComplete={handleConnectorMoveComplete}
/>
```

## Data Structure

Connectors are stored separately from icons but reference icons by ID:

```typescript
const mapData: MapData = {
  id: "map-1",
  name: "Campus Map",
  imageUrl: "/campus.jpg",
  icons: [
    { id: "icon-1", ... },
    { id: "icon-2", ... },
  ],
  connectors: [
    {
      id: "conn-1",
      startIconId: "icon-1",
      endIconId: "icon-2",
      color: "#3b82f6",
      width: 3,
      style: "dashed",
      label: "Main Path"
    }
  ]
};
```

## Visual Behavior

- **Lines update automatically** when connected icons are moved
- **Connectors render below icons** (in SVG layer) but above the map image
- **Hover areas** are wider than visible lines for easier interaction
- **Connect mode** temporarily disables icon dragging and editing
- **Instructions** update dynamically based on current mode

## Styling

Connector colors match the color palette used throughout the application:
- Gray (default)
- Red
- Blue
- Green
- Orange
- Purple
- Cyan
- Pink

Line styles provide semantic meaning:
- **Solid**: Primary connections
- **Dashed**: Secondary or optional paths
- **Dotted**: Suggested or future connections
