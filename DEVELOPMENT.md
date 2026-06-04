# Development Guide

> Everything contributors need to set up, understand, run, and extend **PIIK.ME** locally.

> This document reflects the project structure and architecture at the time of writing. If the codebase and documentation differ, the source code should be considered the authoritative reference.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Project Structure](#project-structure)
- [Key Modules](#key-modules)
- [API Routes](#api-routes)
- [WebSocket Events](#websocket-events)
- [Database Schema](#database-schema)
- [Frontend Architecture](#frontend-architecture)
- [Scripts](#scripts)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Deployment](#deployment)

---

## Architecture Overview

PIIK.ME is a **client-server** application:

- **Backend**: Node.js + Express.js server (`server.js`) serving both a REST API and static frontend files. Real-time events are handled via Socket.IO.
- **Frontend**: Vanilla HTML/CSS/JavaScript — no frontend framework. Firebase SDK is loaded client-side for authentication.
- **Database**: Google Cloud Firestore (NoSQL) via Firebase Admin SDK on the server and Firebase SDK on the client.
- **Auth**: Firebase Authentication with Google OAuth 2.0. The server verifies Firebase ID tokens on protected routes.
- **Deployment**: Vercel (serverless), configured via `vercel.json`.

```
Browser  <──── HTTP/WS ────>  Express Server  <──── Admin SDK ────>  Firestore
   │                                │
Firebase SDK (auth)          Socket.IO (real-time analytics)
```

---

## Tech Stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Runtime       | Node.js v18+                                  |
| Web Framework | Express.js 4.x                                |
| Real-time     | Socket.IO 4.x                                 |
| Auth          | Firebase Authentication (Google OAuth)        |
| Database      | Firebase Firestore                            |
| Frontend      | Vanilla JS, HTML5, CSS3                       |
| 3D / Visuals  | Three.js, Globe.gl, D3 Scale                  |
| QR Codes      | `qrcode` (server), `qr-code-styling` (client) |
| Security      | Helmet, express-rate-limit, DOMPurify         |
| ID Generation | nanoid                                        |
| HTTP Client   | Axios                                         |
| Dev Server    | nodemon                                       |
| Deploy        | Vercel                                        |

---

## Prerequisites

- **Node.js** v18+ or higher — [Download](https://nodejs.org)
- **npm** (bundled with Node.js)
- **Git**
- A **Google Account** to create a Firebase project
- A **Firebase project** — [Create one free](https://console.firebase.google.com)

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/xthxr/piik.me.git
cd piik.me

# 2. Install dependencies
npm install

# 3. Configure environment (see next section)
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Update Firebase web config
# Edit public/js/firebase-config.js with your Firebase web app credentials

# 5. Start dev server (auto-reload)
npm run dev

# Or start without auto-reload
npm start
```

Open `http://localhost:3000` in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=3000
BASE_URL=http://localhost:3000

# Firebase Admin SDK (from your Firebase project → Service Accounts → Generate new private key)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

For Vercel deployment, set these same values in the Vercel dashboard under **Project Settings → Environment Variables**.

---

## Firebase Setup

> For detailed Firebase configuration instructions and troubleshooting, see [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md).

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.

2. **Enable Google Authentication**
   - Authentication → Sign-in method → Google → Enable

3. **Create Firestore Database**
   - Firestore Database → Create database → Start in production mode
   - Choose a region close to your users

4. **Configure Firestore Security Rules** (paste into the Rules tab):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /links/{linkId} {
         allow read: if request.auth != null && resource.data.userId == request.auth.uid;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
       }
       match /analytics/{shortCode} {
         allow read: if request.auth != null;
         allow write: if true; // server-side writes only in production
       }
       match /bioLinks/{username} {
         allow read: if true;
         allow write: if request.auth != null && resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

5. **Get Admin SDK credentials**
   - Project Settings → Service Accounts → Generate new private key
   - Copy values to your `.env` file

6. **Get Web App credentials**
   - Project Settings → Your apps → Add app (Web)
   - Copy the config object into `public/js/firebase-config.js`

7. **Add authorized domains** (for OAuth redirect)
   - Authentication → Settings → Authorized domains → Add `localhost`

---

## Project Structure

```
piik.me/
├── config/
│   └── firebase.config.js      # Firebase Admin SDK initialization
├── docs/                        # Additional documentation
├── public/                      # Static frontend (served at /)
│   ├── assets/                  # Icons, images
│   ├── css/                     # Stylesheets
│   ├── js/
│   │   ├── app.js               # Main dashboard logic
│   │   ├── auth.js              # Firebase Auth integration
│   │   ├── bio-link.js          # Bio link page logic
│   │   ├── qr-generator.js      # QR code generation
│   │   └── firebase-config.js   # Firebase web credentials (not committed)
│   ├── index.html               # Dashboard
│   ├── bio.html                 # Bio link page template
│   └── landing.html             # Public landing page
├── scripts/
│   └── set-verified-badges.js   # Admin script: grant verified status
├── src/
│   ├── middleware/
│   │   └── auth.middleware.js   # Firebase token verification
│   ├── routes/                  # Modular Express route handlers
│   ├── services/
│   │   └── memory.service.js    # In-memory caching layer
│   └── utils/
│       └── url.utils.js         # URL validation and helpers
├── .env.example                 # Environment variable template
├── middleware.js                # Top-level middleware registration
├── server.js                    # Express app entry point
├── vercel.json                  # Vercel deployment config
└── package.json
```

---

## Where to Start

If you're contributing to PIIK.ME for the first time, begin with these files and directories:

1. `server.js` – Application entry point and server initialization.
2. `src/routes/` – API route definitions and request handling.
3. `src/services/` – Core business logic and service layer.
4. `src/middleware/` – Authentication and request middleware.
5. `public/js/app.js` – Frontend dashboard functionality.

Understanding these components will provide a high-level overview of how the application is structured and how data flows through the system.

## Key Modules

### `server.js`

Entry point. Initializes Express, registers middleware, mounts routes, starts Socket.IO, and binds the HTTP server to `PORT`.

### `config/firebase.config.js`

Initializes the Firebase Admin SDK using credentials from environment variables. Import this wherever Firestore or Auth Admin access is needed.

### `src/middleware/auth.middleware.js`

Express middleware that extracts the `Authorization: Bearer <token>` header, verifies it against Firebase Auth, and attaches the decoded user to `req.user`. Apply to any protected route.

### `src/routes/`

Modular route files mounted in `server.js`. Each file handles a specific resource (links, analytics, bio, tracking, etc.).

### `src/services/memory.service.js`

Lightweight in-memory cache for analytics data, reducing Firestore reads during high-traffic periods. Data is periodically flushed to Firestore.

### `src/utils/url.utils.js`

Utility functions: URL validation, short code generation helpers, UTM parameter parsing.

---

## API Routes

| Method | Path                               | Auth        | Description                      |
| ------ | ---------------------------------- | ----------- | -------------------------------- |
| `POST` | `/api/shorten`                     | ✅ Required | Create a short link              |
| `GET`  | `/api/user/links`                  | ✅ Required | List authenticated user's links  |
| `GET`  | `/api/analytics/:shortCode`        | ✅ Required | Get analytics for a link         |
| `POST` | `/api/track/impression/:shortCode` | ❌ Public   | Record an impression             |
| `POST` | `/api/track/share/:shortCode`      | ❌ Public   | Record a share                   |
| `GET`  | `/:shortCode`                      | ❌ Public   | Redirect and record click        |
| `POST` | `/api/github/bug`                  | ✅ Required | Create a GitHub bug report issue |

**Authentication header format:**

```
Authorization: Bearer <firebase-id-token>
```

---

## WebSocket Events

PIIK.ME uses Socket.IO on the same HTTP server. Connect from the client:

```js
const socket = io();

socket.on('analyticsUpdate', (data) => {
  // data = { shortCode, impressions, clicks, shares, devices, browsers, ... }
  updateDashboard(data);
});
```

The server emits `analyticsUpdate` to all connected clients whenever a click, impression, or share is recorded for any link.

---

## Database Schema

### `links/{shortCode}`

```js
{
  originalUrl: string,
  shortCode: string,
  shortUrl: string,
  userId: string,           // Firebase UID
  userEmail: string,
  createdAt: Timestamp,     // Firestore server timestamp
  utmParams: {
    source: string,
    medium: string,
    campaign: string,
    term: string,
    content: string
  }
}
```

### `analytics/{shortCode}`

```js
{
  impressions: number,
  clicks: number,
  shares: number,
  devices: { mobile: number, desktop: number },
  browsers: { chrome: number, firefox: number, safari: number, edge: number, other: number },
  referrers: { [domain]: number },
  clickHistory: [{ timestamp: Timestamp, device: string, browser: string, referrer: string }]
}
```

### `bioLinks/{username}`

```js
{
  username: string,
  displayName: string,
  bio: string,
  profilePicture: string,
  links: [{ title: string, url: string, order: number }],
  backgroundStyle: string,
  verified: boolean,
  userId: string,
  createdAt: Timestamp
}
```

---

## Frontend Architecture

The frontend uses **no JavaScript framework**. Each HTML page loads only the scripts it needs:

- `firebase-config.js` — Firebase initialization
- `auth.js` — Handles sign-in/sign-out state
- `app.js` — Dashboard: link creation, analytics, QR codes
- `bio-link.js` — Bio link editor with live preview and drag-and-drop
- `qr-generator.js` — Standalone QR code UI

All pages communicate with the backend via `fetch()` calls with the Firebase ID token in the `Authorization` header.

---

## Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Grant verified badge to a user (admin only)
node scripts/set-verified-badges.js <userId>
```

---

## Coding Standards

- Use **ES6+** syntax (const/let, arrow functions, template literals, async/await).
- Keep route handlers thin — move business logic into `src/services/`.
- Always validate and sanitize user input server-side. Use `dompurify`/`isomorphic-dompurify` for any HTML rendering.
- Use `async/await` instead of callbacks or `.then()` chains.
- Use descriptive variable names. Avoid single-letter variables except in simple loops.
- Add a comment for any non-obvious logic.
- Follow the `.editorconfig` settings: 2-space indentation, LF line endings, UTF-8 encoding.

---

## Git Workflow

```bash
# 1. Fork the repo and clone your fork
git clone https://github.com/YOUR_USERNAME/piik.me.git

# 2. Create a feature branch from main
git checkout -b feature/your-feature-name

# 3. Make changes, commit often
git add .
git commit -m "feat: add drag-and-drop link reordering"

# 4. Keep your branch up to date
git fetch upstream
git rebase upstream/main

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```

**Commit message format:**

```
type: short description

Types: feat | fix | docs | style | refactor | test | chore
```

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set all environment variables in the Vercel dashboard. The `vercel.json` at the repo root handles routing configuration.

### Production Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] `BASE_URL` set to the production domain
- [ ] Firebase authorized domains updated to include production domain
- [ ] Firestore security rules reviewed and tightened
- [ ] Rate limiting configured (`express-rate-limit` already included)
- [ ] HTTPS enforced (Vercel handles this automatically)
- [ ] Error logging set up (Sentry recommended)

## Troubleshooting

### Port 3000 Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

### Firebase Credential Errors

- Verify FIREBASE_PRIVATE_KEY is copied correctly.
- Ensure newline characters (\n) are preserved.
- Confirm the project ID matches your Firebase project.

### Module Not Found Errors

```bash
npm install
```

---

## Related Documentation

For additional project information, see:

- `README.md` – Project overview and user-facing information
- `CONTRIBUTING.md` – Contribution guidelines
- `TESTING.md` – Testing procedures and validation checklist
- `SECURITY.md` – Security policies and vulnerability reporting
- `CHANGELOG.md` – Release history and notable changes
