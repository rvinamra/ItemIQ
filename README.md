# ItemIQ Website

Marketing website for ItemIQ - a transaction intelligence app that transforms bank transactions into itemized receipts.

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

## Project Structure

```
itemiq-website/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main app component
│   ├── contexts/
│   │   └── AuthContext.jsx    # Auth state provider (sessionStorage)
│   ├── pages/
│   │   ├── Layout.jsx        # Navigation layout
│   │   ├── LoginPage.jsx     # Login screen (auth gate)
│   │   ├── index.jsx         # Route definitions + auth gate
│   │   └── Home.jsx          # Homepage
│   ├── components/
│   │   └── home/
│   │       ├── Hero.jsx          # Hero section with CTA buttons
│   │       ├── CallToAction.jsx  # Bottom CTA with waitlist/contact
│   │       ├── WaitlistModal.jsx # Waitlist signup form
│   │       └── ContactModal.jsx  # Contact form
│   ├── config/
│   │   └── emailjs.js        # EmailJS configuration
│   └── api/
│       └── entities/         # Base44 entity wrappers
├── src-index.html            # Vite build entry point
├── index.html                # Production index with SPA routing
├── 404.html                  # GitHub Pages SPA redirect
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## EmailJS Configuration

Email notifications are sent via EmailJS when users submit the waitlist or contact forms.

### Setup

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create an email service (e.g., Gmail)
3. Create templates for waitlist and contact forms
4. Update `src/config/emailjs.js` with your credentials:

```javascript
export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_itemiq",
  TEMPLATE_WAITLIST: "template_waitlist",
  TEMPLATE_CONTACT: "template_contact",
  PUBLIC_KEY: "your-public-key"
};

export const NOTIFY_EMAILS = [
  "email1@example.com",
  "email2@example.com"
];
```

## GitHub Pages SPA Routing

Since GitHub Pages doesn't support SPA routing natively, we use a workaround:

1. **404.html** - Catches all 404s and redirects to index.html with the path as a query parameter
2. **index.html** - Contains a script that reads the query parameter and uses `history.replaceState` to restore the original URL

This allows direct links to routes like `https://itemiq.io/demo` to work correctly.

## Authentication

The site is gated behind a login screen. Visitors must enter credentials before accessing any content.

- **Member ID:** `itemiq_test`
- **Password:** `svcholdings_ITEMIQ`
- Session is stored in `sessionStorage` (clears when the browser tab is closed)
- To change credentials, update the constants in `src/contexts/AuthContext.jsx` and bump `AUTH_VERSION`

## Key Features

### Hero Section
- "Test App (Beta)" - Links to the main ItemIQ app
- "See It In Action" - Scrolls to demo section
- "Demo" - Links to demo page

### Waitlist Form
- User type selection (Merchant, Card Issuer, Consumer)
- Email collection
- EmailJS integration for notifications

### Contact Form
- Name, email, message fields
- EmailJS integration for team notifications

## Related Repositories

- **Backend:** [itemiq-backend](https://github.com/rvinamra/itemiq-backend)
- **Frontend App:** [itemiq-frontend](https://github.com/rvinamra/itemiq-frontend)

## Build Notes

### Important: Vite Entry Point

The project uses `src-index.html` as the Vite build entry point (configured in `vite.config.js`). This file references `/src/main.jsx` directly, which allows Vite to bundle the full React application.

```javascript
// vite.config.js
build: {
  rollupOptions: {
    input: 'src-index.html'
  }
}
```

### Asset Paths

GitHub Pages requires relative asset paths. The `base: './'` configuration in `vite.config.js` ensures all asset references use relative paths.
