import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Pressable } from "react-native";
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import app from "../../firebaseConfig";
import { getDatabase, ref, onValue } from "firebase/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

// --- 4. DISTANCE CALCULATION (Haversine) ---
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.5:3000";

export default function LiveMap({ route, navigation }: any) {
  const { busId, start, end } = route.params;

  // State Management
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  const [busSpeed, setBusSpeed] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<string>("0.00");
  
  // Refs for real-time tracking without re-triggering hooks
  const hasInitializedMap = useRef(false);
  const isFollowingRef = useRef(true);
  const userLocRef = useRef<{lat: number, lng: number} | null>(null);
  const prevBusLocRef = useRef<{lat: number, lng: number, timestamp: number} | null>(null);
  const mapRef = useRef<MapView>(null);

  const setFollowMode = (follow: boolean) => {
    isFollowingRef.current = follow;
    setIsFollowing(follow);
  };

  useEffect(() => {
    // --- 8. CLEAN IMPLEMENTATION ---
    let locSubscription: Location.LocationSubscription | null = null;
    let unsubscribeFirebase = () => {};

    // --- 2. REAL-TIME PASSENGER LOCATION (Expo Location - Google Maps Style) ---
    const startPassengerTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn("[PASSENGER] Map Permission Denied.");
          return;
        }

        locSubscription = await Location.watchPositionAsync(
          { 
            accuracy: Location.Accuracy.BestForNavigation, 
            timeInterval: 1000, 
            distanceInterval: 1 
          },
          (loc) => {
            // Reject heavily cached locations
            const currentTime = Date.now();
            if (currentTime - loc.timestamp > 3000) {
              console.log("[PASSENGER] Rejected cached location frame.");
              return;
            }

            userLocRef.current = { lat: loc.coords.latitude, lng: loc.coords.longitude };
            // --- 9. DEBUGGING LOGS ---
            console.log(`[PASSENGER API] Live GPS Lat: ${loc.coords.latitude}, Lng: ${loc.coords.longitude}`);
          }
        );
      } catch (err) {
        console.error("Passenger GPS Tracking Error:", err);
      }
    };
    startPassengerTracking();

    const fetchBusDetails = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await axios.get(`${BASE_URL}/api/passenger/live/${busId}`, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`[API RESPONSE] Route Stops Fetched successfully`);
        if (res.data.stops && res.data.stops.length > 0) setStops(res.data.stops);
      } catch (err) {
        console.error("Error fetching bus details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusDetails();

    // --- 3. REAL-TIME BUS LOCATION (Firebase every 0.5s) ---
    const database = getDatabase(app);
    const dbRef = ref(database, `busLocations/${busId}`);
    
    unsubscribeFirebase = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.latitude != null && data.longitude != null) {
          const currentTimestamp = Date.now();
          const newLoc = { lat: data.latitude, lng: data.longitude };
          
          setBusLocation(newLoc);
          console.log(`[BUS API] Lat: ${newLoc.lat}, Lng: ${newLoc.lng}`);

          // --- 5. BUS SPEED CALCULATION ---
          let currentSpeed = data.speed || 0; // Use backend speed if available
          
          if (!data.speed && prevBusLocRef.current) {
            const distTraveled = calculateDistance(prevBusLocRef.current.lat, prevBusLocRef.current.lng, newLoc.lat, newLoc.lng); // km
            const timeDiffHours = (currentTimestamp - prevBusLocRef.current.timestamp) / 3600000; // hours
            if (timeDiffHours > 0) {
               currentSpeed = Math.round(distTraveled / timeDiffHours);
            }
          }
          setBusSpeed(currentSpeed);
          console.log(`[SPEED API] Computed: ${currentSpeed} km/h`);
          
          prevBusLocRef.current = { lat: newLoc.lat, lng: newLoc.lng, timestamp: currentTimestamp };

          // --- 4. UPDATE DISTANCE ---
          if (userLocRef.current) {
             const dist = calculateDistance(userLocRef.current.lat, userLocRef.current.lng, newLoc.lat, newLoc.lng);
             setDistanceKm(dist.toFixed(2));
             console.log(`[DISTANCE API] User to Bus: ${dist.toFixed(2)} km`);
          }

          // --- 7. MAP BEHAVIOR (AUTO-CENTERING) ---
          if (!hasInitializedMap.current) {
            setRegion({ latitude: newLoc.lat, longitude: newLoc.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
            hasInitializedMap.current = true;
          } else {
            if (isFollowingRef.current && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: newLoc.lat,
                longitude: newLoc.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }, 500); // Smooth 500ms follow
            }
          }
        }
      }
    });

    return () => {
      unsubscribeFirebase();
      if (locSubscription) locSubscription.remove();
    };
  }, [busId]);

  const animateToBus = () => {
    setFollowMode(true); 
    if (busLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: busLocation.lat,
        longitude: busLocation.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  const onMapReady = () => {
    if (start && end && mapRef.current) {
      const coords = [
        { latitude: start.lat, longitude: start.lng },
        { latitude: end.lat, longitude: end.lng }
      ];
      if (busLocation) coords.push({ latitude: busLocation.lat, longitude: busLocation.lng });
      setTimeout(() => mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }), 500);
    }
  };

  if (loading || !region) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6A0DAD" />;

  // Safely filter and map valid stops for the Polyline 
  // This explicitly prevents iOS Native Map Threading crashes caused by `null` or `NaN` location geometries
  const validPolylineCoords = stops
    .filter(s => s && typeof s.lat === 'number' && typeof s.lng === 'number' && !isNaN(s.lat) && !isNaN(s.lng))
    .map(s => ({ latitude: s.lat, longitude: s.lng }));

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onMapReady={onMapReady}
        onPanDrag={() => {
          if (isFollowingRef.current) {
            setFollowMode(false);
            console.log("[MAP UI] Auto-centering disabled. User exploring map.");
          }
        }}
        zoomEnabled={true}
        scrollEnabled={true}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {validPolylineCoords.length > 1 && (
          <Polyline coordinates={validPolylineCoords} strokeColor="#4A90E2" strokeWidth={4} />
        )}

        {start && <Marker coordinate={{ latitude: start.lat, longitude: start.lng }} title={`Start: ${start.name}`} pinColor="green" />}
        {end && <Marker coordinate={{ latitude: end.lat, longitude: end.lng }} title={`Destination: ${end.name}`} pinColor="red" />}

        {stops.map((stop, index) => {
          if ((start && stop.name === start.name) || (end && stop.name === end.name)) return null;
          return (
            <Marker key={index} coordinate={{ latitude: stop.lat, longitude: stop.lng }} title={stop.name}>
              <View style={styles.stopMarker}><View style={styles.stopMarkerInner} /></View>
            </Marker>
          );
        })}

        {busLocation && (
          <Marker 
             coordinate={{ latitude: busLocation.lat, longitude: busLocation.lng }} 
             title="Live Bus"
             description={`Speed: ${busSpeed} km/h`}
             pinColor="purple"
          />
        )}
      </MapView>

      {/* --- 1 & 6. UI DISPLAY (CLEAN HUD) --- */}
      <View style={styles.hudContainer}>
         <View style={styles.hudRow}>
            <View style={styles.hudData}>
              <Text style={styles.hudLabel}>BUS SPEED</Text>
              <Text style={styles.hudValue}>{busSpeed} <Text style={styles.hudUnit}>km/h</Text></Text>
            </View>
            <View style={styles.hudSplitter} />
            <View style={styles.hudData}>
              <Text style={styles.hudLabel}>DISTANCE</Text>
              <Text style={styles.hudValue}>{distanceKm} <Text style={styles.hudUnit}>km</Text></Text>
            </View>
         </View>
         <View style={styles.hudEtaBox}>
           <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
           <Text style={styles.hudEtaText}>Active Real-Time Tracking</Text>
         </View>
      </View>

      <View style={styles.uiOverlay}>
        <Pressable style={[styles.iconButton, isFollowing ? { backgroundColor: '#6A0DAD' } : { backgroundColor: '#fff' }]} onPress={animateToBus}>
          <MaterialCommunityIcons name="crosshairs-gps" size={28} color={isFollowing ? "#fff" : "#6A0DAD"} />
        </Pressable>

        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  hudContainer: { position: 'absolute', top: 50, left: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 15, padding: 15, elevation: 5 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  hudData: { alignItems: 'center' },
  hudLabel: { fontSize: 11, color: '#888', fontWeight: 'bold', marginBottom: 5 },
  hudValue: { fontSize: 28, fontWeight: '900', color: '#333' },
  hudUnit: { fontSize: 14, fontWeight: 'normal', color: '#666' },
  hudSplitter: { width: 1, height: 40, backgroundColor: '#ddd' },
  hudEtaBox: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  hudEtaText: { fontSize: 12, color: '#666', marginLeft: 5 },
  uiOverlay: { position: 'absolute', bottom: 30, right: 20, alignItems: 'flex-end' },
  iconButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  backButton: { flexDirection: 'row', backgroundColor: '#6A0DAD', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, elevation: 5, alignItems: 'center' },
  backText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  stopMarker: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', borderWidth: 2, borderColor: '#4A90E2', justifyContent: 'center', alignItems: 'center' },
  stopMarkerInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4A90E2' },
});
