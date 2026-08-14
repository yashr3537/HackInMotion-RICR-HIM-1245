# AirGuard — Environmental Risk & Air Quality Platform

AirGuard is a real-time environmental risk & air quality monitoring platform built with React, Vite, Open-Meteo Live APIs, and Supabase Database & Authentication.

## Features & Highlights

- **Real-Time Air Quality & Weather**: Live Open-Meteo API integrations for AQI, PM2.5, PM10, NO₂, SO₂, O₃, CO, temperature, humidity, wind, and pressure.
- **Supabase Backend Integration**: Real Supabase Auth (Sign In / Register / Session management), User Profiles table (`profiles`), Saved Locations (`saved_locations`), Environmental Snapshots (`air_quality_snapshots`), and Risk Alerts (`alerts`).
- **Interactive Multi-City Compare**: Live city search with 300ms debouncing, live AQI parallel fetching, duplicate detection, max 6 city limit, and single-click removal.
- **Risk Intelligence Engine**: Centralized AQI classification, dominant pollutant calculator, personalized sensitivity guidance, and Activity Risk Advisor.
- **Full Offline Fallbacks**: Graceful fallback states (`src/data/fallbackData.js`) in case live APIs or network calls encounter issues.

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (@supabase/supabase-js)
- **APIs**: Open-Meteo Air Quality & Weather API, Nominatim / BigDataCloud Geocoding
- **Visualization**: Recharts & Lucide Icons

## Getting Started

1. **Environment Setup**:
   Configure `.env` in the `frontend` folder with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://<your-supabase-id>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
   ```

2. **Installation & Running**:
   ```bash
   npm install
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
src/
  auth.jsx                   Consolidated Supabase Auth Provider & Hooks
  components/                Reusable UI components (AQICard, RiskBadge, LocationCard...)
  pages/                     Application views (Dashboard, Explore, Compare, Alerts, Activity...)
  services/
    airQuality/              Open-Meteo live AQI & 2-day forecast service
    location/                Geocoding & location search service
    supabase/                Single Supabase Client & CRUD service
  utils/
    riskEngine/              AQI bands, dominant pollutant, guidance & activity risk engine
    validation/              Form validation utilities (email, password, full name)
  data/
    demoData.js              Static marketing content for Landing page (features, howItWorks)
    fallbackData.js          Emergency offline fallback values
```
