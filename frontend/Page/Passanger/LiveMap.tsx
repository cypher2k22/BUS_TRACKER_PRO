import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Animated, Pressable } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import app from "../../firebaseConfig";
import { getDatabase, ref, onValue } from "firebase/database";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function LiveMap({ route, navigation }: any) {
  const { busId } = route.params;
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchBusDetails = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await axios.get(`${BASE_URL}/api/passenger/live/${busId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.stops && res.data.stops.length > 0) {
          setStops(res.data.stops);
        }

        // Initial location
        if (res.data.latitude != null && res.data.longitude != null) {
          setLocation({ lat: res.data.latitude, lng: res.data.longitude });
        }
      } catch (err) {
        console.error("Error fetching bus details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusDetails();

    // Set up Realtime Database Listener
    const database = getDatabase(app);
    const dbRef = ref(database, `busLocations/${busId}`);
    
    unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.latitude != null && data.longitude != null) {
          setLocation({ lat: data.latitude, lng: data.longitude });
        }
      } else {
        console.log("No live location data found.");
      }
    }, (error) => {
      console.error("Firebase DB error:", error);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    return () => {
      unsubscribe();
      pulseAnim.stopAnimation();
    };
  }, [busId]);

  // Only run the region code when necessary, it behaves better with initial map rendering
  const mapRegion = location 
    ? { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : stops.length > 0 
      ? { latitude: stops[0].lat, longitude: stops[0].lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }
      : undefined;

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6A0DAD" />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
      >
        {/* Draw Route Polyline */}
        {stops.length > 0 && (
          <Polyline 
            coordinates={stops.map(s => ({ latitude: s.lat, longitude: s.lng }))} 
            strokeColor="#4A90E2" 
            strokeWidth={4} 
          />
        )}

        {/* Draw Stop Markers */}
        {stops.map((stop, index) => (
          <Marker 
            key={index}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={stop.name}
            description={index === 0 ? "Start" : index === stops.length - 1 ? "End" : `Stop ${index + 1}`}
          >
            <View style={styles.stopMarker}>
              <View style={styles.stopMarkerInner} />
            </View>
          </Marker>
        ))}

        {/* Draw Bus Live Location */}
        {location && (
          <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} title="Live Bus">
            <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.markerCore} />
          </Marker>
        )}
      </MapView>

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  pulse: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(106, 13, 173, 0.3)' },
  markerCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#6A0DAD', position: 'absolute', top: 5, left: 5, borderWidth: 2, borderColor: '#fff' },
  stopMarker: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', borderWidth: 2, borderColor: '#4A90E2', justifyContent: 'center', alignItems: 'center' },
  stopMarkerInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4A90E2' },
  backButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#6A0DAD', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, elevation: 5 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
