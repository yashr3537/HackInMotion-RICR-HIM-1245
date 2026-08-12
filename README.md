# AirGuard — Frontend

Environmental Risk & Air Quality Monitoring Platform.
**Frontend only** — no backend, database, auth, or real API calls. All data
comes from `src/data/demoData.js` so it can be swapped for live API
responses later without touching component code.

## Tech stack

- React + Vite
- Tailwind CSS
- React Router
- Recharts (charts)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/       Reusable UI building blocks (cards, nav, charts, states…)
  pages/            One file per route (Landing, Dashboard, Alerts, …)
  data/
    demoData.js     Centralized demo/mock data — the ONLY place with hardcoded values
    aqiUtils.js      AQI band thresholds, colors, and status helpers
  App.jsx           Route definitions
  main.jsx          App entry point
```

## Routes

| Path         | Page                          |
|--------------|--------------------------------|
| `/`          | Landing page                   |
| `/login`     | Login (UI only, no auth logic) |
| `/dashboard` | Main dashboard                 |
| `/explore`   | Search any location             |
| `/locations` | Manage saved locations          |
| `/compare`   | Compare locations side by side  |
| `/history`   | Historical analytics            |
| `/alerts`    | Alerts inbox                    |
| `/activity`  | Activity Risk Advisor           |
| `/profile`   | User & environmental profile    |
| `/settings`  | App settings                    |

## Connecting a real backend later

1. Replace the exported values/functions in `src/data/demoData.js` with API
   calls (e.g. `fetch`/React Query) — component code doesn't need to change
   as long as the shape of the data stays the same.
2. Wire up `/login` with real authentication.
3. Replace the AQI classification thresholds in `src/data/aqiUtils.js` if
   your backend uses a different standard (e.g. US EPA vs CPCB India).

## Notes

- All AQI figures, pollutant values, alerts, and locations are illustrative
  demo data — not live readings.
- Fully responsive: sidebar collapses to a bottom nav bar on mobile.
- Activity Risk Advisor intentionally avoids medical claims (see disclaimer
  on that page).
