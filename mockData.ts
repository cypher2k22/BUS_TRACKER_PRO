// mockData.ts

// ================== USERS ==================
export const mockUsers = [
  {
    id: 1,
    fullusername: "John Doe",
    email: "john@example.com",
    usename: "john123",
    password: "123456",
    role: "passenger", // could be passenger/admin/driver
  },
  {
    id: 2,
    fullusername: "Jane Smith",
    email: "jane@example.com",
    usename: "jane456",
    password: "abcdef",
    role: "passenger",
  },
];

// ================== ROUTES ==================
export const mockRoutes = [
  {
    id: 1,
    start: "Colombo Fort",
    destination: "Mount Lavinia",
    stops: ["Pettah", "Wellawatta", "Dehiwala"],
    duration: "30 mins",
    fare: 50,
  },
  {
    id: 2,
    start: "Nugegoda",
    destination: "Kotte",
    stops: ["Rajagiriya", "Battaramulla"],
    duration: "25 mins",
    fare: 40,
  },
  {
    id: 3,
    start: "Maradana",
    destination: "Bambalapitiya",
    stops: ["Kirulapone", "Wellawatta", "Bambalapitiya"],
    duration: "35 mins",
    fare: 55,
  },
];

// ================== BUS SCHEDULES ==================
export const mockSchedules = [
  {
    routeId: 1,
    busNumber: "AB-1234",
    departure: "08:00 AM",
    arrival: "08:30 AM",
  },
  {
    routeId: 1,
    busNumber: "AB-5678",
    departure: "09:00 AM",
    arrival: "09:30 AM",
  },
  {
    routeId: 2,
    busNumber: "CD-9876",
    departure: "07:30 AM",
    arrival: "07:55 AM",
  },
];

// ================== LIVE TRACKING ==================
export const mockBusLocations = [
  {
    busNumber: "AB-1234",
    lat: 6.9271,
    lng: 79.8612,
    routeId: 1,
  },
  {
    busNumber: "AB-5678",
    lat: 6.9275,
    lng: 79.8670,
    routeId: 1,
  },
  {
    busNumber: "CD-9876",
    lat: 6.9150,
    lng: 79.8640,
    routeId: 2,
  },
];

// ================== ROUTE INFO ==================
export const mockRouteInfo = [
  {
    routeId: 1,
    stops: [
      { name: "Pettah", time: "08:05 AM", fare: 10 },
      { name: "Wellawatta", time: "08:15 AM", fare: 20 },
      { name: "Dehiwala", time: "08:25 AM", fare: 50 },
    ],
  },
  {
    routeId: 2,
    stops: [
      { name: "Rajagiriya", time: "07:35 AM", fare: 15 },
      { name: "Battaramulla", time: "07:50 AM", fare: 40 },
    ],
  },
];
