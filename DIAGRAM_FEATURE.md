# Diagram Feature - Event Location Planning

A comprehensive diagramming system for creating and managing event location layouts. This feature allows users to upload blueprints or aerial photos and place customizable icons to plan event setups.

## Features

### 🗺️ Interactive Canvas
- **Pan & Zoom**: Mouse wheel zoom and pan functionality (middle-click or pan tool)
- **Background Images**: Support for blueprints, floor plans, and aerial photographs
- **Responsive**: Auto-fits diagram to viewport on load

### 🎨 Icon Library
30+ pre-built icons organized by category:
- **Furniture**: Chairs, sofas, tables, desks
- **Audio/Visual**: Speakers, microphones, monitors, projectors
- **Lighting**: Lights, lamps, spotlights
- **Staging**: Stages, music equipment, DJ booths
- **Equipment**: Boxes, containers, storage
- **Markers**: Location pins, dots, people areas
- **Shapes**: Circles, squares, triangles

### ✨ Icon Manipulation
- **Drag & Drop**: Drag icons from palette onto canvas
- **Move**: Click and drag icons to reposition
- **Resize**: Drag corner handle to resize (hold Shift for aspect ratio)
- **Rotate**: Use top handle to rotate icons 360°
- **Customize**: Change color, opacity, and layer order

### 📝 Properties Panel
Edit detailed properties for each item:
- Name and description/instructions
- Position (X, Y coordinates)
- Size (width, height)
- Rotation (0-360°)
- Color (hex color picker)
- Opacity (0-100%)
- Z-index (layering order)

### 💾 Auto-Save
- Changes are automatically saved to the database
- Optimistic UI updates for instant feedback
- No manual save required

## File Structure

```
app/
  diagrams/
    page.tsx                          # Diagram list page
    new/page.tsx                      # Create new diagram
    [id]/page.tsx                     # Diagram editor
  api/
    diagrams/
      route.ts                        # List & create diagrams
      [id]/
        route.ts                      # Get, update, delete diagram
        items/
          route.ts                    # List & create items
          [itemId]/route.ts           # Update & delete items

components/
  diagram/
    diagram-canvas.tsx                # Main canvas with pan/zoom
    diagram-item.tsx                  # Individual icon on canvas
    icon-palette.tsx                  # Draggable icon library
    properties-panel.tsx              # Properties editor panel

lib/
  types/diagram.ts                    # TypeScript type definitions
  icons/icon-library.tsx              # Icon definitions
  prisma.ts                           # Prisma client instance

prisma/
  schema.prisma                       # Database schema
```

## Database Schema

### Diagram
- `id`: Unique identifier
- `name`: Diagram name
- `description`: Optional description
- `imageUrl`: Background image URL
- `imageWidth`: Image width for scaling
- `imageHeight`: Image height for scaling
- `userId`: Creator user ID
- `eventId`: Optional event link
- `items`: Relation to DiagramItem[]

### DiagramItem
- `id`: Unique identifier
- `diagramId`: Parent diagram
- `iconType`: Icon type from library
- `name`: Custom item name
- `description`: Custom description/instructions
- `x`, `y`: Position coordinates
- `width`, `height`: Size dimensions
- `rotation`: Rotation in degrees
- `color`: Hex color code
- `opacity`: Opacity value (0-1)
- `zIndex`: Layer order

## Setup Instructions

### 1. Install Dependencies
All required dependencies are already in package.json:
- `lucide-react`: Icon library
- `@prisma/client`: Database ORM
- `@radix-ui`: UI components (tabs, dialog, etc.)

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Database Migration
```bash
npx prisma migrate dev --name add_diagram_feature
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Feature
Navigate to: `http://localhost:3000/diagrams`

## Usage Guide

### Creating a Diagram
1. Go to `/diagrams`
2. Click "New Diagram"
3. Enter name and description
4. Upload a background image (blueprint, floor plan, etc.)
5. Click "Create Diagram"

### Adding Icons
1. Open a diagram in the editor
2. Browse the Icon Library on the left
3. Drag an icon onto the canvas
4. The icon appears at the drop location

### Manipulating Icons
- **Select**: Click on an icon
- **Move**: Drag the icon
- **Resize**: Drag the blue handle in the bottom-right corner
- **Rotate**: Drag the green handle at the top
- **Delete**: Click the red X or press Delete/Backspace

### Editing Properties
1. Select an icon on the canvas
2. The Properties panel opens on the right
3. Edit name, description, size, rotation, color, etc.
4. Changes are saved automatically

### Canvas Controls
- **Mouse Wheel**: Zoom in/out
- **Pan Tool (H)**: Click and drag to pan
- **Select Tool (V)**: Select and manipulate icons
- **Middle Mouse Button**: Pan while in select mode

## Keyboard Shortcuts
- `Delete` or `Backspace`: Delete selected item
- `V`: Switch to Select tool
- `H`: Switch to Pan tool
- `Shift + Resize`: Maintain aspect ratio

## Customization

### Adding New Icons
Edit `lib/icons/icon-library.tsx`:

```typescript
createIconDef(
  'custom-id',
  'Custom Name',
  ICON_CATEGORIES.EQUIPMENT,
  'Description',
  LucideIconComponent,
  defaultWidth,
  defaultHeight
)
```

### Adding New Icon Categories
Add to `ICON_CATEGORIES` in `lib/icons/icon-library.tsx`

### Modifying Canvas Behavior
Edit `components/diagram/diagram-canvas.tsx`:
- Zoom speed: Adjust `delta` calculation in `handleWheel`
- Max/min zoom: Adjust `Math.min(Math.max(0.1, ...), 5)`
- Initial fit: Modify `useEffect` with scale calculation

## API Endpoints

### Diagrams
- `GET /api/diagrams` - List all diagrams
- `POST /api/diagrams` - Create diagram
- `GET /api/diagrams/[id]` - Get diagram with items
- `PUT /api/diagrams/[id]` - Update diagram
- `DELETE /api/diagrams/[id]` - Delete diagram

### Diagram Items
- `GET /api/diagrams/[id]/items` - List items
- `POST /api/diagrams/[id]/items` - Create item
- `PUT /api/diagrams/[id]/items/[itemId]` - Update item
- `DELETE /api/diagrams/[id]/items/[itemId]` - Delete item

## Technical Details

### No External Diagramming Libraries
This implementation uses:
- **HTML5 Canvas**: Native drag and drop API
- **CSS Transforms**: Rotation, scaling, positioning
- **React State**: Canvas and item state management
- **SVG Icons**: Lucide React for scalable icons

### Performance Optimizations
- Optimistic UI updates
- Debounced API calls
- Efficient re-renders with React.memo potential
- Transform-based positioning (GPU accelerated)

### Browser Compatibility
- Modern browsers with ES2017+ support
- CSS transforms and flexbox
- HTML5 drag and drop API
- FileReader API for image uploads

## Future Enhancements

Potential additions:
- [ ] Undo/Redo functionality
- [ ] Multi-select (Shift+Click)
- [ ] Copy/Paste items
- [ ] Snap to grid
- [ ] Measurement tools
- [ ] Export to PDF/PNG
- [ ] Templates library
- [ ] Collaboration (real-time editing)
- [ ] Comments/annotations
- [ ] Image upload to cloud storage

## Troubleshooting

### Icons not rendering
- Ensure Prisma client is generated: `npx prisma generate`
- Check icon type matches library: `getIconById(iconType)`

### Images not loading
- Verify image URLs are accessible
- Check CORS if loading external images
- Consider implementing image upload to cloud storage

### Performance issues
- Reduce number of items on canvas
- Optimize image sizes
- Consider virtualization for large diagrams

## Contributing

When adding features:
1. Update type definitions in `lib/types/diagram.ts`
2. Update database schema in `prisma/schema.prisma`
3. Run `npx prisma migrate dev`
4. Update API routes as needed
5. Test all CRUD operations
6. Update this README

## License

Part of the Pinpoint v2 application by Creative Solutions Group.
