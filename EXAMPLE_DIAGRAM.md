# Creating the Example Lake Diagram

## Quick Start

After setting up the database (running Prisma generate and migrate), create the example diagram:

### Option 1: Run the full setup script (includes example)
```powershell
.\setup-diagram-feature.ps1
```

### Option 2: Run seed script only
```powershell
npx tsx prisma/seed-diagram.ts
```

Or add to your package.json and run:
```powershell
npm run seed:diagram
```

## What Gets Created

The seed script creates a complete example diagram titled **"Lake Event Setup Example"** featuring:

### Main Stage Area
- Main Stage platform (brown, 120x80px)
- DJ Station/booth (blue)
- Left and Right PA Speakers (angled)
- Stage lighting (2 spotlights in gold)

### Seating & Tables
- VIP Table with 4 chairs arranged around it
- Guest Table 
- 2 Lounge sofas for casual seating

### Food & Beverage
- Bar station
- Food/buffet station

### Equipment & Infrastructure
- Equipment storage container
- Information desk
- WiFi access point

### Special Areas
- Dance floor area (purple, semi-transparent)
- Entrance marker (red pin)

### Layout Details
- **Total items**: 22 items strategically placed
- **Background**: lake-updated-v2.png from /public
- **Image dimensions**: 1920x1080px
- **Various colors**: Realistic colors for different equipment types
- **Layering**: Items have proper z-index for realistic stacking

## Viewing the Example

1. After running the seed script, start your dev server:
   ```powershell
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/diagrams`

3. Click on "Lake Event Setup Example"

4. Explore the interactive diagram:
   - Zoom with mouse wheel
   - Pan by dragging (use pan tool or middle mouse)
   - Select items to see their properties
   - Modify items to learn the interface

## Customizing the Example

Edit `prisma/seed-diagram.ts` to:
- Add more items
- Change positions (x, y coordinates)
- Adjust sizes (width, height)
- Modify colors (hex codes)
- Change rotations (0-360 degrees)
- Update descriptions

After editing, run the seed script again to recreate the diagram.

## Re-running the Seed

The seed script will:
1. Check if "Lake Event Setup Example" already exists
2. Delete the old one if found
3. Create a fresh example diagram

This allows you to re-run the seed script multiple times safely.

## Troubleshooting

### "Cannot find module '@prisma/client'"
Run: `npx prisma generate`

### "Table does not exist"
Run: `npx prisma migrate dev --name add_diagram_feature`

### "tsx not found"
The package.json.new file includes tsx as a dev dependency. 
Either:
- Merge the changes to your package.json
- Run: `npm install -D tsx`
- Or use: `npx tsx prisma/seed-diagram.ts` (npx will download temporarily)

### Different Image Dimensions
If your lake image has different dimensions, update lines in seed-diagram.ts:
```typescript
imageWidth: 1920,  // Change to actual width
imageHeight: 1080, // Change to actual height
```

## Adding to package.json

To add the seed command permanently, add to your package.json:

```json
{
  "scripts": {
    "seed:diagram": "npx tsx prisma/seed-diagram.ts"
  },
  "prisma": {
    "seed": "npx tsx prisma/seed-diagram.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

Then run with: `npm run seed:diagram`

## Notes

- The example uses a placeholder user ID: `'example-user-id'`
- Replace this with actual user authentication when integrated
- All coordinates are in pixels relative to the image
- Colors use standard hex format (#RRGGBB)
- Opacity ranges from 0.0 (transparent) to 1.0 (opaque)
