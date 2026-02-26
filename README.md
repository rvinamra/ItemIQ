# ItemIQ Website

## Live URL

**https://www.itemiq.io**

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Deployment:** GitHub Pages
- **Email Service:** EmailJS

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

## Deployment to GitHub Pages

```bash
# Build the project
npm run build

# Copy built assets to root (GitHub Pages serves from root)
rm -rf assets && cp -r dist/assets .

# Update index.html with new JS filename from dist/
# (Check dist/index.html for the correct filename)

# Commit and push
git add -A && git commit -m "Deploy updates" && git push
```

## Authentication

The site is gated behind a login screen. Visitors must enter credentials before accessing any content.

- Credentials are defined in `src/contexts/AuthContext.jsx` (shared privately, not checked into docs)
- Session is stored in `sessionStorage` (clears when the browser tab is closed)
- To change credentials, update the hash constants in `src/contexts/AuthContext.jsx` and bump `AUTH_VERSION`

## GitHub Pages SPA Routing

Since GitHub Pages doesn't support SPA routing natively, we use a workaround:

1. **404.html** - Catches all 404s and redirects to index.html with the path as a query parameter
2. **index.html** - Contains a script that reads the query parameter and uses `history.replaceState` to restore the original URL

## Related Repositories

- **Backend:** [itemiq-backend](https://github.com/rvinamra/itemiq-backend)
- **Frontend App:** [itemiq-frontend](https://github.com/rvinamra/itemiq-frontend)

## Build Notes

### Vite Entry Point

The project uses `src-index.html` as the Vite build entry point (configured in `vite.config.js`). The `index.html` at root is the SPA redirect handler for GitHub Pages, NOT the Vite entry.

### Asset Paths

GitHub Pages requires relative asset paths. The `base: './'` configuration in `vite.config.js` ensures all asset references use relative paths.
