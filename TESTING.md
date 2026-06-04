# Testing Guide

> Comprehensive testing documentation for **PIIK.ME** — The Ultimate Link Intelligence Toolkit.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Test Environment Setup](#test-environment-setup)
- [Running Tests](#running-tests)
- [Manual Testing Checklist](#manual-testing-checklist)
- [API Testing](#api-testing)
- [WebSocket Testing](#websocket-testing)
- [Firebase & Database Testing](#firebase--database-testing)
- [Frontend Testing](#frontend-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Reporting Bugs](#reporting-bugs)

---

## Overview

PIIK.ME does not currently ship with an automated test suite, but this document defines the manual and integration testing strategy to validate all platform functionality before shipping features or filing pull requests.

All contributors are expected to run the relevant sections of this checklist before opening a PR.

---

## Prerequisites

- Node.js v16+
- A Firebase project configured for testing (separate from production)
- A `.env.test` file (copy `.env.example` and fill in test Firebase credentials)
- `npm` installed
- A modern browser (Chrome or Firefox recommended)

---

## Test Environment Setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/xthxr/piik.me.git
   cd piik.me
   npm install
   ```

2. **Create a test environment file**

   ```bash
   cp .env.example .env.test
   ```

   Fill in your **test** Firebase credentials. Never use production credentials for testing.

3. **Start the server in development mode**

   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000` with auto-reload via `nodemon`.

4. **Open the application**

   Navigate to `http://localhost:3000` in your browser.

---

## Running Tests

Currently, tests are manual. Automated testing (unit, integration, and end-to-end tests) is planned for future releases.

To run the server in a way that makes manual testing straightforward:

```bash
# Development server (auto-reload)
npm run dev

# Production-like server
npm start
```

Check the server console for errors and unexpected behavior during testing.

---

## Manual Testing Checklist

### Authentication

- [ ] Google Sign-In button loads and redirects to Google OAuth
- [ ] Successful authentication redirects to the dashboard
- [ ] Signing out clears the session and redirects to the landing page
- [ ] Unauthenticated users cannot access `/api/user/links` or other protected routes
- [ ] Invalid or expired tokens return a `401 Unauthorized` response

### URL Shortening

- [ ] Pasting a valid URL and clicking "Shorten" creates a short link
- [ ] The generated short code is unique and URL-safe
- [ ] Custom vanity short codes can be specified
- [ ] Real-time availability checking triggers after ~300ms of typing (debounce)
- [ ] Attempting to claim an already-taken short code shows an appropriate error
- [ ] Shortened URLs redirect correctly to the original destination
- [ ] UTM parameters (source, medium, campaign, term, content) can be added and saved

### Analytics Dashboard

- [ ] Clicking a short link increments the click counter in real time (no page refresh)
- [ ] Impression tracking fires correctly when the link page loads
- [ ] Share tracking fires when the share action is triggered
- [ ] Device breakdown (mobile vs desktop) is recorded accurately
- [ ] Browser breakdown (Chrome, Firefox, Safari, Edge, Other) is recorded
- [ ] Referrer tracking captures the referring domain
- [ ] Click history log entries include correct timestamps
- [ ] CTR is calculated and displayed correctly

### QR Code Generation

- [ ] Clicking "Generate QR" creates a QR code for the short URL
- [ ] The QR code can be downloaded as an image
- [ ] Scanning the QR code with a phone redirects to the correct destination

### Bio Link Pages

- [ ] A new bio link page can be created at `piik.me/<username>`
- [ ] Display name, bio, and profile picture fields save correctly
- [ ] Multiple social links can be added
- [ ] Links can be reordered via drag-and-drop
- [ ] Live preview updates in real time during editing
- [ ] Auto-save fires and persists changes without manual action
- [ ] Background style selection changes the page background
- [ ] Verified users display the blue checkmark badge
- [ ] Unverified profiles show "Under Review" status
- [ ] Link previews (favicon + URL) load for each added link

### User Dashboard

- [ ] All links created by the authenticated user are listed
- [ ] Quick stats (clicks, impressions) are visible per link
- [ ] Links are sorted by creation date (newest first)
- [ ] Deleting a link removes it from Firestore and the dashboard

---

## API Testing

Use a tool like [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/), or `curl` to test the REST API.

### Get a Firebase Auth Token

Sign in to the app in your browser, open DevTools → Console, and run:

```js
firebase
  .auth()
  .currentUser.getIdToken(true)
  .then((t) => console.log(t));
```

Copy the token and set it as a variable for subsequent requests.

### Endpoint Tests

| Method | Endpoint                           | Expected Status | Notes                                            |
| ------ | ---------------------------------- | --------------- | ------------------------------------------------ |
| `POST` | `/api/shorten`                     | `200`           | Body: `{ "originalUrl": "https://example.com" }` |
| `POST` | `/api/shorten`                     | `400`           | Omit `originalUrl` — should fail validation      |
| `GET`  | `/api/user/links`                  | `200`           | Requires `Authorization: Bearer <token>`         |
| `GET`  | `/api/user/links`                  | `401`           | No token provided                                |
| `GET`  | `/api/analytics/:shortCode`        | `200`           | Use a valid short code                           |
| `GET`  | `/api/analytics/NOTEXIST`          | `404`           | Invalid short code                               |
| `POST` | `/api/track/impression/:shortCode` | `200`           | Should increment impressions                     |
| `POST` | `/api/track/share/:shortCode`      | `200`           | Should increment shares                          |
| `GET`  | `/:shortCode`                      | `302`           | Should redirect to `originalUrl`                 |

---

## WebSocket Testing

PIIK.ME uses Socket.IO for real-time analytics. To manually test:

1. Open the analytics page for any short link in your browser.
2. In a separate browser tab or incognito window, visit the short link.
3. Observe the analytics dashboard — the click counter should increment **without a page refresh**.

To test via the browser console on the analytics page:

```js
// The socket should already be initialized by app.js
// Trigger a test click manually:
fetch('/api/track/impression/YOUR_SHORT_CODE', { method: 'POST' });
```

Watch the dashboard update in real time.

---

## Firebase & Database Testing

- Verify Firestore `links` and `bioLinks` collections are being written to after relevant actions.
- Confirm Firestore security rules prevent one user from reading or modifying another user's data.
- Test with an expired Firebase token to confirm the middleware rejects it with `401`.
- Confirm server timestamps are used (not client-side dates) by checking Firestore directly in the Firebase console.

---

## Frontend Testing

- Test on **Chrome**, **Firefox**, and **Safari** (desktop and mobile).
- Resize the browser to mobile width (375px) and verify responsive layout.
- Check that glassmorphism UI, parallax effects, and 3D animations render correctly.
- Verify loading animation (rotating logo on black background) appears on slow connections.
- Test with JavaScript disabled — the app should gracefully degrade or show a helpful message.

---

## Performance Testing

- Use Chrome DevTools → Lighthouse to audit performance, accessibility, and best practices.
- Target scores: Performance ≥ 80, Accessibility ≥ 90.
- Verify that Socket.IO connections do not leak (open DevTools → Network → WS tab).
- Check that the analytics dashboard handles 100+ click history entries without UI lag.

---

## Security Testing

- Confirm protected API routes require a valid Firebase Auth token and public endpoints behave as intended.
- Attempt to access another user's links by modifying the `userId` in requests — should be rejected by Firestore rules.
- Test for XSS: enter `<script>alert(1)</script>` in the URL field and bio fields. The app uses `dompurify` — the script should not execute.
- Verify `helmet` security headers are present in API responses (`X-Content-Type-Options`, `X-Frame-Options`, etc.).
- Confirm rate limiting kicks in after 100 requests per 15 minutes from the same IP.

---

## Reporting Bugs

If you find a bug during testing, please [open an issue](https://github.com/xthxr/piik.me/issues/new) using the Bug Report template and include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS version
- Relevant console errors or screenshots

You can also use the in-app **Bug Report** button (if enabled) to quickly submit bug reports to the project maintainers.
