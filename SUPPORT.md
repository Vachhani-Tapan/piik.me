# Support

> Need help with **PIIK.ME**? You're in the right place.

---

## Table of Contents

- [Getting Help](#getting-help)
- [Common Issues & Solutions](#common-issues--solutions)
- [Reporting a Bug](#reporting-a-bug)
- [Requesting a Feature](#requesting-a-feature)
- [Security Vulnerabilities](#security-vulnerabilities)
- [Community](#community)

---

## Getting Help

We have a few support channels depending on the nature of your issue:

| Channel                                                            | Best For                                 |
| ------------------------------------------------------------------ | ---------------------------------------- |
| [GitHub Issues](https://github.com/xthxr/piik.me/issues)           | Bug reports, feature requests            |
| [GitHub Discussions](https://github.com/xthxr/piik.me/discussions) | Questions, ideas, general help           |
| In-app Bug Report button                                           | Quick bug submission from within the app |

Before opening a new issue, please **search existing issues** to see if it has already been reported or answered.

> Please avoid posting sensitive information such as API keys,
> access tokens, passwords, or private credentials in public issues.

---

## Common Issues & Solutions

### The app won't start locally

**Symptom:** `npm run dev` or `npm start` exits with an error.

**Solutions:**

- Make sure you've created a `.env` file from `.env.example` and filled in all Firebase credentials.
- Confirm Node.js version is v14 or higher: `node -v`
- Run `npm install` again to ensure all dependencies are installed.
- Check for syntax errors in `firebase-config.js` — make sure you've replaced the placeholder values with your real Firebase web app config.

---

### Google Sign-In fails or redirects to an error page

**Symptom:** Clicking "Sign in with Google" shows an error or doesn't redirect back.

**Solutions:**

- In the Firebase Console → Authentication → Settings → Authorized domains, add `localhost` (for local dev) or your production domain.
- Confirm Google Sign-In is enabled under Firebase → Authentication → Sign-in method.
- Check the browser console for specific Firebase error codes.

---

### Short links are not redirecting

**Symptom:** Visiting a short URL returns 404 or an error page.

**Solutions:**

- Confirm the short code exists in your Firestore `links` collection.
- Make sure `BASE_URL` in your `.env` matches the domain you're accessing (e.g., `http://localhost:3000`).
- For Vercel deployments, check that your `vercel.json` routing is correct and the deployment succeeded without errors.

---

### Analytics are not updating in real time

**Symptom:** Clicking a link doesn't update the dashboard counter.

**Solutions:**

- Open the browser DevTools → Network → WS tab and confirm a WebSocket connection to the server is established.
- Check the server console for Socket.IO errors.
- Make sure you're viewing the correct analytics page for the short code you just clicked.
- If running behind a proxy or load balancer, confirm WebSocket connections are not being blocked.

---

### Firebase permission denied errors

**Symptom:** Firestore operations fail with `PERMISSION_DENIED`.

**Solutions:**

- Review your Firestore security rules in the Firebase Console.
- Make sure the user is properly authenticated before making requests.
- For Admin SDK operations (server-side), confirm your `FIREBASE_PRIVATE_KEY` environment variable is set correctly. The key must include literal `\n` characters — paste it exactly as it appears in the downloaded service account JSON.

---

### QR code is not generating

**Symptom:** The QR code area is blank or shows an error.

**Solutions:**

- Check the browser console for errors from `qr-code-styling` or `qrcode`.
- Make sure the short URL is valid and resolves correctly.
- Try generating the QR code from the server-side endpoint directly.

---

### Bio link page is not saving

**Symptom:** Changes to the bio page don't persist after refreshing.

**Solutions:**

- Open the browser console and check for Firestore write errors.
- Confirm the user is authenticated.
- Ensure the `username` field is set — the document key is the username.

---

## Reporting a Bug

If you've found a bug that isn't covered above:

1. **Search [existing issues](https://github.com/xthxr/piik.me/issues)** first.
2. **Use the in-app Bug Report button** for quick submission, or open an issue manually.
3. When opening an issue, include:
   - A clear title summarizing the problem
   - Steps to reproduce the issue
   - Expected vs. actual behavior
   - Browser name and version
   - Node.js version (if server-side)
   - Relevant error messages or screenshots

The more detail you provide, the faster we can resolve it.

---

## Requesting a Feature

Have an idea to improve PIIK.ME?

1. Check the [Roadmap](ROADMAP.md) to see if it's already planned.
2. Search [existing issues](https://github.com/xthxr/piik.me/issues) with the `enhancement` label.
3. If it's new, open an issue describing:
   - The problem your feature solves
   - A description of the proposed solution
   - Any alternatives you've considered

Feature requests with community support (👍 reactions) are prioritized.

---

## Security Vulnerabilities

**Please do not report security vulnerabilities in public GitHub issues.**

If you discover a security issue, refer to [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

---

## Community

Join the conversation in [GitHub Discussions](https://github.com/xthxr/piik.me/discussions). Whether you have a question, want to share what you've built with PIIK.ME, or just want to say hi — all are welcome.

Please be respectful and follow our [Code of Conduct](CODE_OF_CONDUCT.md).
