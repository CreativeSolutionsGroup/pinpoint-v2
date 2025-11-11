# 🚀 Quick Start Guide - Diagram Feature

## Prerequisites Checklist
- [x] Node.js installed
- [x] PostgreSQL database configured
- [x] DATABASE_URL in `.env` file
- [x] Dependencies installed (`npm install`)

## 3-Step Setup

### Step 1: Generate Prisma Client (Required)
```powershell
npx prisma generate
```
This creates the TypeScript client for database operations.

### Step 2: Apply Database Migration (Required)
```powershell
npx prisma migrate dev --name add_diagram_feature
```
This creates the `Diagram` and `DiagramItem` tables in your database.

### Step 3: Start Development Server
```powershell
npm run dev
```

## First Use - Create Your First Diagram

### 1. Navigate to Diagrams
Open browser: `http://localhost:3000/diagrams`

### 2. Create New Diagram
1. Click **"New Diagram"** button
2. Fill in the form:
   - **Name**: "Test Event Layout"
   - **Description**: "Testing the diagram feature"
   - **Background Image**: Upload any image (blueprint, floor plan, or photo)
3. Click **"Create Diagram"**

### 3. Add Icons to Canvas
1. Browse the **Icon Library** on the left
2. Categories include:
   - Furniture (chairs, tables)
   - Audio Visual (speakers, monitors)
   - Equipment (boxes, containers)
   - Markers (pins, dots)
   - And more!
3. **Drag an icon** from the library onto the canvas

### 4. Manipulate Icons
- **Select**: Click on an icon
- **Move**: Drag it around
- **Resize**: Drag the blue corner handle
- **Rotate**: Drag the green top handle
- **Delete**: Click red X or press Delete key

### 5. Edit Properties
When an icon is selected, the **Properties Panel** opens on the right:
- Change the **Name** (e.g., "Main Speaker")
- Add **Description** (e.g., "Powered speaker facing audience")
- Adjust **Size** (width/height in pixels)
- Change **Color** (click color picker)
- Modify **Rotation** (0-360° slider)
- Set **Opacity** (0-100% transparency)

### 6. Canvas Controls
- **Mouse Wheel**: Zoom in/out
- **Pan Tool (H)**: Click hand icon or press H, then drag
- **Select Tool (V)**: Click mouse icon or press V
- **Zoom Indicator**: Bottom-right shows current zoom %

### 7. Save Your Work
Changes are **automatically saved** - no need to click save!
(The Save button is there for manual triggers if needed)

## Testing All Features

### Test Icon Manipulation
1. Add a "chair" icon
2. Resize it to 60x60
3. Rotate it to 45°
4. Change color to red (#FF0000)
5. Set opacity to 50%
6. Move it around the canvas

### Test Multiple Items
1. Add 5 different icons
2. Select each one individually
3. Arrange them in a pattern
4. Change z-index to layer them

### Test Canvas Navigation
1. Zoom in to 200%
2. Pan around the canvas
3. Zoom out to 50%
4. Press H for pan tool
5. Press V for select tool

### Test Persistence
1. Make changes to your diagram
2. Navigate back to `/diagrams`
3. Open the diagram again
4. Verify all changes are saved

## Common Tasks

### Change Icon Color
1. Select icon
2. Properties panel → Color section
3. Click color swatch OR type hex code
4. Color updates instantly

### Duplicate Icon Placement
1. Add icon from library
2. Set properties (name, color, size)
3. Drag another of the same icon
4. Copy the properties manually (future: copy/paste feature)

### Organize Items by Layer
1. Select bottom item
2. Properties panel → Z-Index
3. Set to 0 (bottom layer)
4. Select top item
5. Set Z-Index to 10 (top layer)

### Create Event Layout
1. Upload venue floor plan as background
2. Add "table" icons for seating
3. Add "chair" icons around tables
4. Add "stage" icon for performance area
5. Add "speaker" icons for audio
6. Name each item clearly
7. Use descriptions for setup notes

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select Tool |
| `H` | Pan Tool |
| `Delete` | Delete selected item |
| `Backspace` | Delete selected item |
| `Shift + Drag` | Maintain aspect ratio when resizing |
| `Mouse Wheel` | Zoom in/out |
| `Middle Click + Drag` | Pan canvas |

## Troubleshooting

### "Cannot find module '@/lib/generated/prisma'"
**Solution**: Run `npx prisma generate`

### Icons not showing in palette
**Solution**: Check browser console for errors, verify imports in `icon-library.tsx`

### Changes not saving
**Solution**: 
1. Check browser console for API errors
2. Verify database connection
3. Check API route responses in Network tab

### Canvas not displaying background image
**Solution**: 
1. Verify image uploaded successfully
2. Check imageUrl in database
3. Try a different image format (JPG, PNG)

### Can't drag icons
**Solution**: 
1. Ensure you're in Select Tool mode (V)
2. Click the icon to select it first
3. Check browser console for errors

## Next Steps

### Integration Tasks
1. **User Authentication**
   - Update `app/diagrams/new/page.tsx` line 54
   - Replace `'temp-user-id'` with actual user from Stack Auth
   ```typescript
   const user = useUser(); // from Stack Auth
   const userId = user.id;
   ```

2. **Event Linking**
   - Add event selector to new diagram form
   - Link diagrams to specific events
   - Filter diagrams by event

3. **Image Upload**
   - Implement cloud storage (AWS S3, Cloudinary)
   - Replace base64 with cloud URLs
   - Add image optimization

### Feature Additions
- Implement undo/redo (hooks already created)
- Add snap-to-grid option
- Create diagram templates
- Export to PDF/PNG
- Add measurement tools

## API Testing (Optional)

### Using cURL or Postman

**Create Diagram:**
```bash
curl -X POST http://localhost:3000/api/diagrams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Diagram",
    "imageUrl": "https://example.com/image.jpg",
    "imageWidth": 1920,
    "imageHeight": 1080,
    "userId": "test-user"
  }'
```

**Get All Diagrams:**
```bash
curl http://localhost:3000/api/diagrams
```

**Add Item:**
```bash
curl -X POST http://localhost:3000/api/diagrams/{DIAGRAM_ID}/items \
  -H "Content-Type: application/json" \
  -d '{
    "iconType": "chair",
    "name": "Test Chair",
    "x": 100,
    "y": 100,
    "width": 40,
    "height": 40
  }'
```

## Support Resources

- **Feature Documentation**: See `DIAGRAM_FEATURE.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Icon Library**: `lib/icons/icon-library.tsx`
- **Type Definitions**: `lib/types/diagram.ts`

## Success Indicators

You'll know it's working when:
- ✅ You can create a new diagram
- ✅ Icons appear in the palette
- ✅ You can drag icons onto the canvas
- ✅ Icons can be selected and moved
- ✅ Properties panel updates work
- ✅ Changes persist after refresh
- ✅ Multiple diagrams can be created

## Getting Help

If something isn't working:
1. Check browser console for errors
2. Review the troubleshooting section above
3. Verify all setup steps completed
4. Check database connection
5. Review API responses in Network tab

---

**Ready to start?** Run the setup commands and navigate to `/diagrams`! 🎉
