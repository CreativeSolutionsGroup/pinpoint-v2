# Undo/Redo Support for Connectors

## Problem
The original undo/redo system only tracked icon state (`MapIconType[]`), which caused connectors to be lost when undoing or redoing changes, even though both nodes still existed.

## Solution
Updated the history system to track both icons and connectors together as a combined state.

## Changes Made

### 1. New MapState Interface
```typescript
interface MapState {
  icons: MapIconType[];
  connectors: Connector[];
}
```

### 2. Updated State Management
- Changed from `history: MapIconType[][]` to `history: MapState[]`
- Added separate state for connectors: `map1Connectors` and `map2Connectors`
- History now stores both icons and connectors together

### 3. New Handler Functions

**`handleConnectorsChange`**: Live updates for connectors (no history)
```typescript
const handleConnectorsChange = (newConnectors: Connector[]) => {
  setCurrentConnectors(newConnectors);
};
```

**`handleConnectorMoveComplete`**: Adds connector changes to history
```typescript
const handleConnectorMoveComplete = (newConnectors: Connector[]) => {
  const newState: MapState = { icons: currentIcons, connectors: newConnectors };
  saveToHistory(newState);
};
```

**`handleIconMoveComplete`**: Updated to include current connectors
```typescript
const handleIconMoveComplete = (newIcons: MapIconType[]) => {
  const newState: MapState = { icons: newIcons, connectors: currentConnectors };
  saveToHistory(newState);
};
```

**`saveToHistory`**: Centralized history management
- Compares new state with current state
- Only adds to history if something changed
- Updates both icons and connectors
- Clears any "redo" history beyond current point

### 4. Updated Undo/Redo Functions
Both functions now restore both icons AND connectors:
```typescript
const handleUndo = () => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const state = history[newIndex];
    setCurrentIcons(state.icons);
    setCurrentConnectors(state.connectors);
    setForceUpdate(prev => prev + 1);
  }
};
```

## User Experience Improvements

### Before
- Undo/Redo: Connectors would disappear even if both connected icons still existed
- User had to manually recreate connectors after undo operations

### After
- ✅ Undo restores both icons and their connectors
- ✅ Redo reapplies both icons and connectors
- ✅ Complete state consistency across undo/redo operations
- ✅ Connectors properly tracked in history timeline

## History Timeline Example

```
Initial: { icons: [], connectors: [] }
  ↓ Add Icon A
Step 1: { icons: [A], connectors: [] }
  ↓ Add Icon B
Step 2: { icons: [A, B], connectors: [] }
  ↓ Connect A→B
Step 3: { icons: [A, B], connectors: [A→B] }
  ↓ Move Icon A
Step 4: { icons: [A', B], connectors: [A'→B] }  // Connector updated automatically
  ↓ UNDO
Step 3: { icons: [A, B], connectors: [A→B] }    // Both icon and connector restored!
```

## Technical Notes

- History snapshots are taken on "complete" actions (drop, create, edit, delete)
- Live updates during dragging don't add to history (avoids cluttering timeline)
- JSON comparison prevents duplicate history entries
- Each tab (location-1, location-2) has its own state but shares the history array
- Force update triggers re-render when history state changes
