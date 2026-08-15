# README.md

# 🌿 AirGuard – AI Powered Environmental Risk & Air Quality Monitoring Platform

> **Know Your Air. Protect Your Health.**

AirGuard is a full-stack web application developed for the **HackInMotion Hackathon** under the **Environment & CleanTech** theme. The platform helps users monitor real-time air quality, understand environmental risks, receive personalized health guidance, and stay informed through intelligent alerts and historical trend analysis.

Unlike traditional AQI applications that only display pollution values, AirGuard transforms complex environmental data into meaningful health insights based on the user's profile, making air quality information understandable and actionable.

---

# 📌 Problem Statement

Air pollution has become one of the most serious environmental and public health challenges worldwide. Millions of people are exposed to harmful pollutants every day without understanding the associated health risks.

Most existing applications only display AQI values and pollutant concentrations, which are difficult for non-technical users to interpret. Sensitive groups such as children, elderly individuals, asthma patients, and outdoor workers require personalized recommendations rather than raw numerical data.

AirGuard addresses this problem by converting live environmental data into clear risk classifications and personalized health guidance.

---

# 💡 Our Solution

AirGuard is an AI-inspired environmental monitoring platform that combines:

- 🌍 Real-Time Air Quality Monitoring
- 📍 Location-Based Search
- 📈 Historical AQI Tracking
- ❤️ Personalized Health Recommendations
- 🚨 Smart AQI Alerts
- 📊 Risk Classification Engine
- 🗺️ Route Risk Planner
- 🤝 Community Environmental Reporting
- 🌐 Multi-location Monitoring

The platform empowers users to make safer daily decisions based on environmental conditions.

---

# ✨ Key Features

## 🔐 Secure Authentication

- Secure user registration
- Secure login using Supabase Authentication
- Session management
- Private user profiles
- Protected routes
- Individual user data isolation

---

## 🌍 Real-Time Air Quality Monitoring

Users can:

- Search any city or locality
- Use their current device location
- View real-time environmental conditions

Displayed parameters include:

- AQI
- PM2.5
- PM10
- Carbon Monoxide (CO)
- Nitrogen Dioxide (NO₂)
- Sulphur Dioxide (SO₂)
- Ozone (O₃)
- Temperature
- Humidity
- Wind Speed

---

## 📊 Environmental Risk Classification

AirGuard converts raw AQI values into understandable categories.

| AQI     | Risk Level                        |
| ------- | --------------------------------- |
| 0–50    | 🟢 Good                           |
| 51–100  | 🟡 Moderate                       |
| 101–150 | 🟠 Unhealthy for Sensitive Groups |
| 151–200 | 🔴 Unhealthy                      |
| 201–300 | 🟣 Very Unhealthy                 |
| 301+    | ⚫ Hazardous                      |

---

## ❤️ Personalized Health Guidance

Recommendations are generated based on user profile.

Supported profiles:

- General User
- Asthma Patient
- Respiratory Disease
- Senior Citizen
- Child
- Outdoor Worker

Example guidance includes:

- Limit outdoor exposure
- Wear N95 mask
- Keep windows closed
- Avoid jogging
- Use air purifier
- Seek medical advice if symptoms worsen

---

## 📍 Saved Locations

Users can save multiple frequently visited locations such as:

- Home
- Office
- School
- College
- Gym

Each location displays its current AQI status for quick monitoring.

---

## 📈 Historical Air Quality Tracking

AirGuard stores historical air quality snapshots to help users analyze trends.

Features include:

- Daily monitoring
- 7-Day trend
- 30-Day trend
- AQI comparison
- Pollution trend analysis

Interactive charts provide a visual understanding of environmental changes over time.

---

## 🚨 Smart Alert System

The application automatically generates alerts whenever the AQI exceeds configured safety thresholds.

Alerts include:

- High Pollution Warning
- Health Advisory
- Sensitive Group Warning
- Hazardous Air Alert

---

## 🤝 Community Reporting

Users can report environmental issues such as:

- Garbage Burning
- Industrial Smoke
- Construction Dust
- Waste Burning
- Heavy Pollution

Community reports improve environmental awareness and encourage public participation.

---

## 🗺️ Route Risk Planner

Users can compare air quality along different travel routes before:

- Walking
- Running
- Cycling
- Daily Commute

This helps users choose healthier travel paths.

---

## ⚖️ Compare Mode

Compare air quality between multiple cities simultaneously.

Displayed comparisons include:

- AQI
- PM2.5
- PM10
- Risk Level
- Health Recommendation

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- JavaScript

---

## Backend

- Node.js
- Express.js

---

## Database & Authentication

- Supabase Database
- Supabase Authentication
- Row Level Security (RLS)

---

## APIs

- Open-Meteo Air Quality API
- Open-Meteo Geocoding API
- Browser Geolocation API

---

## Visualization

- Chart.js / Recharts
- Responsive Dashboard
- Interactive Charts

---

## Development Tools

- Git
- GitHub
- VS Code
- npm

---

# 🏗️ System Architecture

```
                    +-------------------------+
                    |     React + Vite UI     |
                    +------------+------------+
                                 |
                                 |
                   User Requests & Responses
                                 |
                    +------------v------------+
                    |   Node.js + Express     |
                    | Business Logic & APIs   |
                    +------------+------------+
                                 |
             ------------------------------------------
             |                    |                   |
             |                    |                   |
     +-------v------+    +--------v--------+   +------v------+
     |  Supabase    |    |  Open-Meteo     |   | Browser GPS |
     | Database     |    | Air Quality API |   | Geolocation |
     +--------------+    +-----------------+   +-------------+
```

---

# 📂 Project Structure

```
AirGuard/
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── assets/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── index.js
│
├── supabase/
│   └── schema.sql
│
├── README.md
├── api-documentation.md
├── architecture-diagram.png
└── presentation.pptx
```

url "https://hack-in-motion-ricr-him-1245.vercel.app/"
demo id "ywagdre6@gmail.com"
password "qwer1234"
