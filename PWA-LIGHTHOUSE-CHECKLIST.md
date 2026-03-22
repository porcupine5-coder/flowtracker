# PWA Lighthouse Verification Checklist

## Prerequisites

1. **Generate icons** – Follow `public/icons/ICON-GENERATION.md` to create all required icon sizes (72–512px) from a 1024×1024 PNG. Place them in `public/icons/`.
2. **Build and serve** – `npm run build` then serve the `dist/` folder (e.g. `npx serve dist` or deploy to Vercel).

## Chrome DevTools Audit Steps

### Desktop

1. Open Chrome DevTools (F12) → **Lighthouse** tab.
2. Select **Progressive Web App**.
3. Device: **Desktop**.
4. Run audit.

### Mobile

1. Lighthouse tab → Device: **Mobile**.
2. Run audit.

## Verification Points

| Check | How to Verify |
|-------|---------------|
| **Installable** | Lighthouse "Installable" passes; no manifest/icon errors. |
| **SW active** | DevTools → Application → Service Workers: `flowtracker-static-v1` controlling page. |
| **Offline fallback** | Application → Service Workers → Offline; reload → "You're offline" with Retry button. |
| **No scope errors** | Console has no PWA/scope/caching errors. |
| **PWA score ≥ 95** | Lighthouse PWA category score. |

## Quick Console Checks

```js
// SW registered
navigator.serviceWorker.controller  // should be truthy after load

// Manifest
document.querySelector('link[rel="manifest"]')?.href  // /manifest.json
```

## Troubleshooting

- **Icons 404**: Ensure icons exist in `public/icons/` with exact filenames (see ICON-GENERATION.md).
- **SW not controlling**: Use hard refresh (Ctrl+Shift+R) or clear site data; ensure HTTPS.
- **Installable fails**: Icons must be PNG, correct sizes, and manifest valid.
