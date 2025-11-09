# Connector Feature Guide

## Overview
The connector feature allows you to draw visual connections between icons on the map. This is useful for showing relationships, pathways, or logical connections between different points of interest.

## How to Use Connectors

### Creating a Connector
1. Click the **Link icon** button in the top-right controls (it will turn blue/highlighted)
2. Click on the first icon you want to connect
3. Click on the second icon to complete the connection
4. The connector will be created and you'll exit connect mode automatically

### Editing a Connector
1. Hover over any connector line
2. Click the **Edit button** that appears above the line
3. In the popup menu, you can modify:
   - **Label**: Text that appears on the connector
   - **Description**: Optional notes about the connection
   - **Color**: Choose from 8 predefined colors
   - **Line Style**: Solid, Dashed, or Dotted
   - **Width**: Adjust thickness from 1-10px

### Deleting a Connector
1. Hover over the connector and click the Edit button
2. Click the **Delete Connector** button at the bottom of the menu

### Connector Behavior
- Connectors automatically update their position when icons are moved
- When an icon is deleted, all connectors attached to it are also deleted
- Connectors are rendered below icons in the visual hierarchy
- The connector edit menu appears at the midpoint of the line
- **Duplicate Prevention**: You cannot create multiple connectors between the same two icons (bidirectional check - A→B is the same as B→A)
- A toast notification will appear if you attempt to create a duplicate connector

## Technical Details

### Data Structure
```typescript
interface Connector {
  id: string;
  startIconId: string;      // ID of the starting icon
  endIconId: string;        // ID of the ending icon
  color?: string;           // Hex color (default: #64748b)
  width?: number;           // Line width in pixels (default: 2)
  style?: ConnectorStyle;   // "solid" | "dashed" | "dotted" (default: "solid")
  label?: string;           // Optional label text
  description?: string;     // Optional description
}
```

### Components
- **MapConnector**: Renders individual connector lines using SVG
- **ConnectorEditMenu**: Provides the popup UI for editing connector properties

### Props
The `MapEditor` and `MapCanvas` components now accept connector-related props:
- `initialConnectors` / `connectors`: Array of connector objects
- `onConnectorsChange`: Callback when connectors are modified
- `onConnectorMoveComplete`: Callback for history/undo functionality

## Styling
Connectors use SVG elements with the following features:
- Invisible wider hitbox for easier interaction
- Visual feedback on hover (increases width slightly)
- Supports solid, dashed, and dotted line styles
- Labels with background stroke for readability
- Ring highlight on icons when in connect mode

## Future Enhancements
Potential improvements:
- Arrow heads to show directionality
- Curved/bezier paths instead of straight lines
- Multi-segment connectors with waypoints
- Connector grouping or categories
- Import/export connector data
