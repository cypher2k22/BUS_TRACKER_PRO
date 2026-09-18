# 🚌 BusTrack — Real-Time Public Transport Tracking

BusTrack is a full-stack mobile platform for connecting passengers, drivers, and administrators through live public-transport information.

The project demonstrates **mobile development, REST APIs, authentication, role-based access, Firebase, maps, and real-time location workflows** in one system.

## ✨ Core capabilities

- 📍 Live bus location tracking
- 🗺️ Route and map visualization
- 👤 Passenger experience for searching routes and viewing buses
- 🚌 Driver workflow for trips and location updates
- 🛡️ Admin management and user administration
- 🔐 Firebase Authentication with protected backend routes
- 🔥 Firebase Realtime Database / Firestore integration
- 🌐 Node.js + Express backend API
- 📱 React Native + Expo mobile application

## 🏗️ Architecture

```text
┌──────────────────────┐
│ Passenger / Driver   │
│ React Native + Expo  │
└──────────┬───────────┘
           │ REST / JSON
           ▼
┌──────────────────────┐
│ Node.js + Express    │
│ Routes / Controllers │
│ Auth + Role checks   │
└──────────┬───────────┘
           │
     ┌─────┴──────────┐
     ▼                ▼
 Firebase         Maps / Location
 Auth + Data      Google Maps APIs
```

## 🛠️ Tech stack

| Layer | Technologies |
|---|---|
| Mobile | React Native, Expo, TypeScript |
| Backend | Node.js, Express |
| Data | Firebase |
| Authentication | Firebase Authentication |
| Maps | Google Maps APIs, react-native-maps |
| Networking | Axios, REST, Socket.IO client |
| Location | expo-location |

## 📁 Repository structure

```text
BUS_TRACKER_PRO/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── repos/
│   ├── routes/
│   ├── services/
│   └── index.js
└── frontend/
    ├── Page/
    ├── assets/
    ├── components/
    └── App.tsx
```

## 🚀 Run locally

### 1. Clone

```bash
git clone https://github.com/cypher2k22/BUS_TRACKER_PRO.git
cd BUS_TRACKER_PRO
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `FIREBASE_SERVICE_ACCOUNT_PATH` to a local Firebase Admin SDK service-account JSON file. **Do not commit that file.**

For a quick connectivity check:

```text
GET /api/health
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Configure your local Google Maps credentials and backend API URL according to your Expo environment.

## 🔐 Security notes

- Firebase service-account credentials are loaded from an environment-configured path.
- Credential files and environment files are ignored by Git.
- Never commit Google Maps keys, Firebase service-account JSON, or other private credentials.
- Production deployments should restrict CORS origins and API keys rather than using development-wide access.

## ✅ Continuous integration

GitHub Actions checks:

- Backend Node.js syntax with `npm run check`
- Frontend Expo web export

The workflow runs on pushes and pull requests targeting `main`.

## 📸 Screenshots

The repository contains screens covering administration, drivers, passengers, user management, routes, and live tracking.

## 🧭 Roadmap

- Push notifications
- Offline-aware location handling
- Production monitoring and structured logging
- Stronger API validation and automated integration tests
- Production deployment configuration

## 👤 Author

**Bakeerathan Karthigan**  
Computer Engineering Undergraduate  
University of Sri Jayewardenepura

GitHub: https://github.com/cypher2k22
