# 🚌 BUS_TRACKER_PRO
🚧 Under Active Development

A smart bus tracking mobile application built using React Native (Expo) and Node.js.  
It enables real-time bus tracking, route management, and seamless interaction between Admins, Drivers, and Passengers.

---

## 🎯 Problem Solved

Public transport users often face uncertainty about bus arrival times and locations.

This application solves that by providing:
- Real-time bus tracking
- Accurate route information
- Better coordination between drivers and passengers

---

## 🧠 System Architecture

- Mobile App (React Native) communicates with backend API
- Backend (Node.js/Express) handles business logic and authentication
- Firebase stores user data and real-time bus location updates
- Google Maps API is used for visualization and tracking

---

## 🚀 Key Features

### 👨‍💼 Admin Portal
- Dashboard with real-time statistics
- Bus management (create, assign drivers, activate/deactivate trips)
- User management
- Route creation
- Live tracking dashboard
- Feedback monitoring

### 🚍 Driver Portal
- View assigned routes
- Start/Stop live tracking
- Real-time speed/location updates
- View passenger info

### 🧑‍🤝‍🧑 Passenger Portal
- Search routes
- View schedules
- Track bus live
- Submit feedback

---

## 🛠 Tech Stack

| Category | Technology |
|--------|-----------|
| Frontend | React Native (Expo), TypeScript |
| Backend | Node.js, Express |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Maps | Google Maps API |
| Location | expo-location |

---

## 📸 Screenshots

### Admin Dashboard
![Admin](https://github.com/user-attachments/assets/7d92bfe3-762c-4e2e-a19b-c7e4b33ce465)

### User Management
![Users](https://github.com/user-attachments/assets/afe8cf42-dbe9-4ea9-ac0a-43f85add9257)

### Live Tracking
![Tracking](https://github.com/user-attachments/assets/56392048-d7d3-400b-ba25-da8002fd9b21)

### Driver Panel
![Driver](https://github.com/user-attachments/assets/42598c50-3ee4-4c75-81b0-94bbb79ff619)

### Passenger App
![Passenger](https://github.com/user-attachments/assets/565ff9eb-ff8b-46da-b248-0ca94e34ffdd)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repo
```bash
git clone https://github.com/cypher2k22/BUS_TRACKER_PRO.git
2️⃣ Backend Setup
cd backend
npm install
npm run dev
Add Firebase Admin SDK JSON in:
/backend/config/
3️⃣ Frontend Setup
cd frontend
npm install
npm start

Create .env file:

EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000
🧠 How It Works
Drivers send GPS data 📍
Backend processes it
Passengers receive updates
Admin monitors system
🚀 Future Improvements
Push notifications 🔔
Payment system 💳
Seat booking 🎟️
