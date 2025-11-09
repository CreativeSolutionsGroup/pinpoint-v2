# Copy, Duplicate, and Paste Feature

## Overview
Users can now copy, duplicate, and paste icons on the map for faster map creation and editing workflows.

## Features

### Copy
- **Location**: Icon settings menu
- **Action**: Stores the icon in clipboard for pasting later
- **Button**: "Copy" button with Copy icon
- **Feedback**: Toast notification: "Icon Copied - Press Ctrl+V to paste the icon"

### Duplicate
- **Location**: Icon settings menu
- **Action**: Immediately creates a copy of the icon, offset by 5% in both X and Y
- **Button**: "Duplicate" button with CopyPlus icon
- **Feedback**: Toast notification: "Icon Duplicated"

### Paste (Ctrl+V / Cmd+V)
- **Keyboard Shortcut**: `Ctrl+V` (Windows/Linux) or `Cmd+V` (Mac)
- **Action**: Creates a new icon from the last copied icon at the current mouse position
- **Feedback**: Toast notification: "Icon Pasted"
- **Requirements**: Must have copied an icon first
- **Smart Positioning**: Icon appears exactly where your mouse cursor is hovering

## Usage

### Quick Duplicate
1. Hover over an icon
2. Click the settings button
3. Click "Duplicate"
4. A new icon appears slightly offset from the original

### Copy and Paste
1. Hover over an icon
2. Click the settings button
3. Click "Copy"
4. Move your mouse to where you want the new icon
5. Press `Ctrl+V` (or `Cmd+V` on Mac)
6. A new icon appears exactly where your cursor is
7. Can paste multiple times at different positions to create multiple copies

## Technical Details

### Positioning Behavior
- **Duplicate**: Offsets the new icon by +5% in X and Y coordinates from the original
- **Paste**: Places the icon at the current mouse cursor position (tracked in real-time)
- All positions are clamped between 0-100% to keep icons within bounds
- Mouse position updates as you move the cursor over the canvas, accounting for zoom and pan

### State Management
- `copiedIcon` state stores the currently copied icon
- `mousePosition` state tracks cursor position as percentage coordinates (0-100%)
- Mouse position updates on every mouse move over the canvas
- Position calculations account for zoom and pan transformations
- Persists across operations until a new icon is copied
- Independent from the icons array (doesn't reference it)

### Keyboard Event Handler
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      handlePaste();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [handlePaste]);
```

### ID Generation
Each new icon (whether duplicated or pasted) gets a unique ID:
```typescript
id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
```

## Workflow Examples

### Creating Multiple Similar Icons
1. Place and configure one icon (color, size, rotation, etc.)
2. Click "Copy" in its settings
3. Press `Ctrl+V` multiple times to create copies
4. Drag each copy to its desired location

### Quick Pattern Creation
1. Set up an icon with specific styling
2. Use "Duplicate" repeatedly to create a row/column
3. Adjust positions as needed

## User Interface

### Settings Menu Layout
```
┌─────────────────────────┐
│ Name: [input]           │
│ Description: [textarea] │
│ Size: [-] [+]           │
│ Rotation: [↺] [↻]      │
│ Color: [picker]         │
├─────────────────────────┤
│ [Copy] [Duplicate]      │  ← New buttons
├─────────────────────────┤
│ [Delete Icon]           │
└─────────────────────────┘
```

## Integration with History
- Both duplicate and paste operations call `onIconMoveComplete` to add to undo/redo history
- Each copy/paste action can be undone
- Undo removes the newly created icon

## Future Enhancements
Potential improvements:
- Copy multiple icons at once (multi-select)
- Copy with connectors included
- Paste at cursor/mouse position
- Copy/paste between different maps
- Clipboard persistence across sessions
