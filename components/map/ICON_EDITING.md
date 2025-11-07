# Icon Editing Features

## Overview
Icons on the map can now be customized with rotation, size, and color adjustments through an intuitive edit menu.

## Features

### 1. **Edit Menu**
- Click the **Settings** (⚙️) button that appears when hovering over any icon
- Opens a convenient popover menu with all editing options

### 2. **Size Control**
- Use **-** and **+** buttons to decrease/increase icon size
- Range: 0.5x to 3x (increments of 0.25x)
- Default: 1x
- Current size displayed in the middle

### 3. **Rotation Control**
- Use **↺** (counter-clockwise) and **↻** (clockwise) buttons to rotate
- Rotates in 15° increments
- Range: 0° to 360°
- Current rotation displayed in the middle

### 4. **Color Customization**
- **Color Slider**: Pick any custom color using the native color picker
- **Color Presets**: Quick access to 8 preset colors:
  - Red (#ef4444)
  - Orange (#f97316)
  - Yellow (#eab308)
  - Green (#22c55e)
  - Blue (#3b82f6) - default
  - Purple (#a855f7)
  - Pink (#ec4899)
  - Gray (#6b7280)
- Selected preset shows a black border

### 5. **Delete Icon**
- Delete button moved to the bottom of the edit menu
- Red destructive styling for clear indication

## Technical Details

### New Properties
Icons now support these additional properties:
```typescript
interface MapIcon {
  // ... existing properties
  rotation?: number; // 0-360 degrees
  size?: number;     // 0.5-3 scale multiplier
}
```

### Components
- **IconEditMenu**: New component managing all edit controls
- **MapIcon**: Updated to apply CSS transforms for rotation and size
- **MapCanvas**: Passes update handler to icons
- **MapEditor**: Initializes new icons with default rotation (0°) and size (1x)

### History Integration
All changes (size, rotation, color) are automatically saved to the undo/redo history, just like moving or deleting icons.

## Usage Tips
1. Hover over any icon to reveal the settings button
2. Click the settings button to open the edit menu
3. Adjust size, rotation, and color as needed
4. Click outside the menu or make another change to close it
5. Use Undo/Redo (Ctrl+Z/Ctrl+Y) to revert changes

## Keyboard Shortcuts
- The edit menu remains open while making adjustments
- Press Esc or click outside to close the menu
- All standard map shortcuts still work (Shift+Drag to pan, Scroll to zoom)
