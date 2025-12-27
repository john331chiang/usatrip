# USA 15‑Day Road Trip — 40‑Slide Web Deck (GitHub Pages)

Static site that acts like a slide deck (Prev/Next + sidebar list + search).
Images auto-load from Wikipedia thumbnails when available.

## Files
- index.html
- styles.css
- app.js
- slides.json

## Publish to GitHub Pages
1. Create a repo (e.g., `usa-road-trip-deck`) and upload all files to the repo root.
2. Repo → Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` / folder: `/ (root)`
5. Save, then wait for the Pages URL.

## If some slides show no image
That means the Wikipedia query has no thumbnail. You can edit `slides.json` to tweak the image query,
or host your own images and modify `app.js` to prefer your URLs.
