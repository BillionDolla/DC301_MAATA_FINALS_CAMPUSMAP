# Campus Map & Location Guide

A responsive Vue single-page application for finding campus buildings and managing the rooms, services, and facilities inside them. The sample campus data makes the project ready to explore and demonstrate immediately.

## Project requirements

- Provide a clear landing page and at least three navigable application pages.
- Help students search and browse buildings and campus locations.
- Support complete create, read, update, and delete (CRUD) operations for buildings and individual places.
- Keep building details, favorite selections, and places available after a page refresh.
- Offer an accessible, responsive experience with campus data backup and restore.

## Pages

| Page | Path | Purpose |
| --- | --- | --- |
| Overview | `/` | Project introduction, requirements, live campus totals, and page links |
| Campus map | `/map` | Select buildings from an illustrated campus map; manage buildings and places |
| Building directory | `/directory` | Search, filter, sort, favorite, and edit buildings |
| Favorites | `/favorites` | Quickly revisit saved buildings and their key places |
| Settings & data | `/settings` | Change appearance, view statistics, export/import backups, and reset data |

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To make a production build:

```sh
npm run build
npm run preview
```

## Deploy to Vercel

This repository includes `vercel.json` for Vercel's Vite build and SPA route handling. The rewrite makes direct links and browser refreshes on `/map`, `/directory`, `/favorites`, and `/settings` serve the Vue application instead of returning a 404.

1. Push the project to a GitHub repository.
2. In Vercel, choose **Add New → Project**, import that GitHub repository, and keep the detected Vite settings (install: `npm ci`, build: `npm run build`, output: `dist`).
3. Choose **Deploy**. Vercel will build each push to the connected branch and publish the updated site.

No API keys, environment variables, or external services are required for the current app.

## Clone on another computer

Commit and push the project files, including `package-lock.json`, to GitHub. On another computer, install Node.js 20.19+ or 22.12+, clone the repository, and run:

```sh
git clone <your-github-repository-url>
cd <repository-folder>
npm ci
npm run dev
```

The sample buildings and places are included in the code, so a fresh browser starts with usable demo data. Vercel serves the production build from the same repository. There are no local absolute paths or machine-specific environment settings.

## Demonstration walkthrough

1. Start at Overview and explain the requirements and the five SPA routes.
2. Open Campus map and select a pin to inspect a building.
3. Create a building, then add a place to it. Edit each record and delete a place.
4. Star a building, locate it in Favorites, then remove the favorite.
5. Search and filter the Building directory; edit or delete a record.
6. Refresh to demonstrate persistence, then export a JSON backup in Settings.

## Implementation

- Vue 3 Composition API and Vue Router 4.
- Shared reactive campus store in `src/stores/campusStore.js`.
- Browser `localStorage` persistence; no account or backend is required. Each browser/device keeps its own edits; the app does not sync user changes between computers.
- Settings support light/dark themes, compact view, live statistics, and JSON backup restore.
- Import replaces current campus data only after confirmation and validates the backup format.

Campus data is stored only in the current browser. Export a backup before clearing site data or switching devices.
