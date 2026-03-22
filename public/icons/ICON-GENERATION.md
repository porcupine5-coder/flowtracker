# PWA Icon Generation

FlowTracker needs icons in these sizes. Use one of these free tools:

## Option 1: Maskable.app (recommended)

1. Go to https://maskable.app/
2. Upload a **1024×1024 PNG** source image
3. Use the safe zone preview for maskable icons
4. Export or use the PWA Asset Generator link to download all sizes

## Option 2: PWA Builder Image Generator

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload a **1024×1024 PNG** source image
3. Download the generated zip
4. Extract icons to `all/public/icons/` with these exact filenames:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## Output path

Place all icons in:

```
all/public/icons/
```

## Filenames (exact)

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Maskable icon tip

For best results on Android (Chrome) and Lighthouse:
- Keep important content in the center 80% of the image (safe zone)
- Avoid text or logos at the edges
- Both `any` and `maskable` purposes are defined in manifest.json
