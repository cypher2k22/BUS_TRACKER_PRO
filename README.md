# BUS_TRACKER_PRO

A comprehensive smart bus tracking mobile application built with React Native (Expo) and Node.js. It features live location tracking, robust user management for Admins, Drivers, and Passengers, and feedback handling.

## 🚀 Built With
* **Frontend:** React Native, Expo, TypeScript, React Navigation
* **Backend:** Node.js, Express
* **Database & Auth:** Firebase (Firestore, Realtime Database, Authentication)
* **Maps & Location:** `react-native-maps`, `expo-location`

## ✨ Features
### Admin Portal
* **Dashboard Overview:** Comprehensive stats showing Total/Live Buses, Drivers, Passengers, and Routes.
* **Bus Management:** Create, Delete, and dynamically assign Drivers to scheduled buses. Easily Toggle Active/Deactivated states for active trips.
* **User Management:** Full CRM-style control over Drivers and Passengers. Disable rogue drivers or delete expired passenger accounts.
* **Route Setup:** Add designated routes with multiple comma-separated stops.
* **Live Tracking:** See an overview map plotting all active buses polling their real-time coordinates.
* **Feedback Viewer:** Review comprehensive passenger ratings and feedback.

### Driver Portal
* **Active Route Operations:** View allocated route, start/stop broadcasts for real-time tracking (speed/location/heading).
* **Passenger Information:** See stats or profiles of passengers assigned to the route.

### Passenger Portal
* **Search Routes:** Look up point-to-point buses based on from/to stops.
* **Daily Schedule:** View all scheduled buses traversing the city today.
* **Live Tracking:** Track your specific bus on the map.
* **Feedback:** Rate the service upon trip completion.

## 🛠 Project Structure
* `/frontend`: The React Native Expo application. 
  - Install dependencies using `npm install`
  - Start app using `npm start`
* `/backend`: The Express Node API.
  - Required `.env` defining Firebase Admin credentials.
  - Start server using `npm run dev` or `node server.js`

## 📦 Setup Instructions
1. Clone the repository.
2. Initialize Firebase in your Firebase Console and fetch the `firebase-adminsdk` json file.
3. Place your Admin SDK json in `/backend/config/` and update `npm start`.
4. Create a `.env` in the `frontend` dir exporting `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000`.
5. Run the DB/Backend locally, and use Expo Go on your physical device for real-time location tracking tests.