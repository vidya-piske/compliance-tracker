# Compliance Tracker: Frontend

React + Vite + TypeScript single-page app for the Compliance Tracker.

- **State:** Redux Toolkit (auth / current user); server data is fetched per page
- **Routing:** React Router with role-based protected routes
- **Styling:** Tailwind CSS
- **API:** calls the Express backend with `credentials: 'include'` so the httpOnly session cookie is sent

See the [main README](../README.md) for features, architecture, and how to run the full stack locally.

```bash
npm install
npm run dev     # http://localhost:5173 (proxies /api to :4000)
npm run build
```
