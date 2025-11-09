# Multi-Select Drag Feature

## Overview
The multi-select drag feature allows users to select multiple icons at once using a drag-selection box, then copy and paste them as a group while maintaining their relative positions.

## User Interface

### Selection
1. **Drag-Select**: Hold `Ctrl` (or `Cmd` on Mac) and drag on an empty area of the canvas to create a selection box
2. **Visual Feedback**: 
   - Selection box appears as a blue semi-transparent rectangle with blue border while dragging
   - Selected icons show a blue border (4px) and a blue ring (semi-transparent)
3. **Clear Selection**: Click on empty space without Ctrl to deselect all icons

### Copy & Paste
1. **Copy Multiple Icons**: 
   - Select icons using drag-select
   - Press `Ctrl+C` (or `Cmd+C` on Mac)
   - Toast notification shows: "X icons copied"
2. **Paste Multiple Icons**:
   - Press `Ctrl+V` (or `Cmd+V` on Mac) after copying
   - Icons are pasted as a group centered at the mouse cursor position
   - Relative positions between icons are maintained
   - Newly pasted icons become the new selection
   - Toast notification shows: "X icons pasted"

## Technical Implementation

### State Management
```typescript
// Selection state
const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
const [isSelecting, setIsSelecting] = useState(false);
const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });

// Multi-copy state
const [copiedIcons, setCopiedIcons] = useState<MapIconType[]>([]);
```

### Key Components

#### MapCanvas (`map-canvas.tsx`)
- **Selection Box Rendering**: Renders a blue rectangle during drag-select
- **Icon Selection Logic**: Calculates which icons fall within selection bounds
- **Copy Handler**: Stores selected icons in `copiedIcons` array
- **Paste Handler**: 
  - Calculates centroid of copied icons
  - Offsets each icon relative to mouse position
  - Maintains spacing between icons
  - Generates new IDs for pasted icons

#### MapIcon (`map-icon.tsx`)
- **`isSelected` Prop**: Accepts boolean to indicate selection state
- **Visual Styling**: 
  - Blue border when selected: `border-blue-400 border-4`
  - Blue ring when selected: `ring-4 ring-blue-400/50`

### Event Handlers

#### Drag Selection (`handlePanStart`, `handlePanMove`, `handlePanEnd`)
```typescript
// Start selection on Ctrl+Click empty space
if (!clickedOnIcon && e.button === 0 && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
  setIsSelecting(true);
  setSelectionStart({ x, y });
}

// Update selection box during drag
if (isSelecting) {
  setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
}

// Finalize selection on mouse up
if (isSelecting) {
  const selected = icons.filter(icon => 
    iconX >= minX && iconX <= maxX && iconY >= minY && iconY <= maxY
  );
  setSelectedIconIds(new Set(selected.map(i => i.id)));
}
```

#### Copy (`handleCopy`)
```typescript
const handleCopy = useCallback(() => {
  if (selectedIconIds.size === 0) return;
  const selectedIcons = icons.filter(icon => selectedIconIds.has(icon.id));
  setCopiedIcons(selectedIcons);
  toast.success(`${selectedIcons.length} icon${selectedIcons.length !== 1 ? 's' : ''} copied`);
}, [selectedIconIds, icons]);
```

#### Multi-Paste (`handlePaste`)
```typescript
const handlePaste = useCallback(() => {
  if (copiedIcons.length > 0) {
    // Calculate centroid of copied icons
    const centroidX = copiedIcons.reduce((sum, icon) => sum + icon.position.x, 0) / copiedIcons.length;
    const centroidY = copiedIcons.reduce((sum, icon) => sum + icon.position.y, 0) / copiedIcons.length;
    
    // Create new icons with positions relative to mouse position
    const newIcons = copiedIcons.map(icon => {
      const offsetX = icon.position.x - centroidX;
      const offsetY = icon.position.y - centroidY;
      
      return {
        ...icon,
        id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: Math.max(0, Math.min(mousePosition.x + offsetX, 100)),
          y: Math.max(0, Math.min(mousePosition.y + offsetY, 100)),
        },
      };
    });
    
    // Add pasted icons and select them
    const updatedIcons = [...icons, ...newIcons];
    onIconsChange(updatedIcons);
    setSelectedIconIds(new Set(newIcons.map(icon => icon.id)));
  }
}, [copiedIcons, icons, mousePosition]);
```

## Coordinate System
- Selection box coordinates: Canvas viewport pixels (affected by scroll position)
- Icon positions: Percentage-based (0-100% of canvas dimensions)
- Conversion needed when checking if icons fall within selection bounds
- Must account for zoom and pan transformations

## Keyboard Shortcuts
- `Ctrl+Drag` / `Cmd+Drag`: Create selection box
- `Ctrl+C` / `Cmd+C`: Copy selected icons
- `Ctrl+V` / `Cmd+V`: Paste copied icons at mouse position
- Click (no modifiers): Clear selection

## User Instructions
Bottom canvas instruction text:
> "Drag icons to add • Move icons • Ctrl+Drag to select • Ctrl+C/V to copy/paste • Drag map to pan • Scroll to zoom"

## Backward Compatibility
- Single-icon copy/paste (via icon menu) still works
- Legacy `copiedIcon` state maintained for single-icon operations
- Multi-paste takes precedence if `copiedIcons.length > 0`

## Future Enhancements
- [ ] Ctrl+Click to toggle individual icon selection (additive)
- [ ] Shift+Click to select range of icons
- [ ] Select all with Ctrl+A
- [ ] Delete multiple selected icons with Delete key
- [ ] Drag selected group to move all at once
- [ ] Copy connectors along with icons
- [ ] Duplicate selection (Ctrl+D)
