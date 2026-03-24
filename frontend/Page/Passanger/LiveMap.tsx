import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Animated, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import { auth } from "../../firebaseConfig";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function LiveMap({ route, navigation }: any) {
  const { busId } = route.params;
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchLocation = async (isInitial = false) => {
    if (!isInitial) setPolling(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${BASE_URL}/api/passenger/live/${busId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Match backend keys: latitude and longitude
      if (res.data.latitude != null && res.data.longitude != null) {
        setLocation({ lat: res.data.latitude, lng: res.data.longitude });
      }
    } catch (err) {
      console.error("Polling error fetching location");
    } finally {
      setLoading(false);
      setTimeout(() => setPolling(false), 1000);
    }
  };

  useEffect(() => {
    fetchLocation(true);
    const interval = setInterval(fetchLocation, 5000);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6A0DAD" />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        region={location ? { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 } : undefined}
      >
        {location && (
          <Marker coordinate={{ latitude: location.lat, longitude: location.lng }}>
            <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.markerCore} />
          </Marker>
        )}
      </MapView>
      
      {polling && (
        <View style={styles.pollIndicator}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.pollText}>Updating Live...</Text>
        </View>
      )}

      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  pollIndicator: { 
    position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: 'rgba(106, 13, 173, 0.8)', 
    flexDirection: 'row', padding: 10, borderRadius: 25, alignItems: 'center' 
  },
  pollText: { color: '#fff', marginLeft: 8, fontSize: 12, fontWeight: 'bold' },
  pulse: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(106, 13, 173, 0.3)' },
  markerCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#6A0DAD', position: 'absolute', top: 5, left: 5, borderWidth: 2, borderColor: '#fff' },
  backButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#6A0DAD', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, elevation: 5 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
