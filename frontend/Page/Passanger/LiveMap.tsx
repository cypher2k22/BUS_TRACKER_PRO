import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Animated, Pressable, Platform } from "react-native";
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import app from "../../firebaseConfig";
import { getDatabase, ref, onValue } from "firebase/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000");

export default function LiveMap({ route, navigation }: any) {
  const { busId, start, end } = route.params;
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | null>(null);
  const [isFollowing, setIsFollowing] = useState(true);
  
  const hasInitializedMap = useRef(false);
  const isFollowingRef = useRef(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);

  const setFollowMode = (follow: boolean) => {
    isFollowingRef.current = follow;
    setIsFollowing(follow);
  };

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
          if (!hasInitializedMap.current) {
            setRegion({
              latitude: res.data.stops[0].lat,
              longitude: res.data.stops[0].lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }
        }

        if (res.data.latitude != null && res.data.longitude != null) {
          const loc = { lat: res.data.latitude, lng: res.data.longitude };
          setLocation(loc);
          if (!hasInitializedMap.current) {
            setRegion({
              latitude: loc.lat,
              longitude: loc.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
            hasInitializedMap.current = true;
          }
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
          const newLoc = { lat: data.latitude, lng: data.longitude };
          setLocation(newLoc);

          if (!hasInitializedMap.current) {
            setRegion({
              latitude: newLoc.lat,
              longitude: newLoc.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
            hasInitializedMap.current = true;
          } else {
            if (isFollowingRef.current && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: newLoc.lat,
                longitude: newLoc.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }, 500); // 0.5s smooth pan exactly as ping fires
            }
          }
        }
      } else {
        console.log("No live location data found for bus:", busId);
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

  const animateToBus = () => {
    setFollowMode(true); // Re-enable follow mode!
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.lat,
        longitude: location.lng,
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
      if (location) coords.push({ latitude: location.lat, longitude: location.lng });
      
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true
        });
      }, 500);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6A0DAD" />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region || undefined}
        onMapReady={onMapReady}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPanDrag={() => {
          if (isFollowingRef.current) {
            setFollowMode(false);
            console.log("Auto-centering disabled. User is exploring the map.");
          }
        }}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        {/* Draw Route Polyline */}
        {stops.length > 0 && (
          <Polyline 
            coordinates={stops.map(s => ({ latitude: s.lat, longitude: s.lng }))} 
            strokeColor="#4A90E2" 
            strokeWidth={4} 
          />
        )}

        {/* Start Marker */}
        {start && (
          <Marker 
            coordinate={{ latitude: start.lat, longitude: start.lng }}
            title={`Start: ${start.name}`}
            pinColor="green"
          />
        )}

        {/* End Marker */}
        {end && (
          <Marker 
            coordinate={{ latitude: end.lat, longitude: end.lng }}
            title={`Destination: ${end.name}`}
            pinColor="red"
          />
        )}

        {/* Draw Stop Markers */}
        {stops.map((stop, index) => {
          if (start && stop.name === start.name) return null;
          if (end && stop.name === end.name) return null;
          return (
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
          );
        })}

        {/* Draw Bus Live Location */}
        {location && (
          <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} title="Live Bus">
            <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.markerCore} />
          </Marker>
        )}
      </MapView>

      <View style={styles.uiOverlay}>
        <Pressable 
          style={[styles.iconButton, isFollowing ? { backgroundColor: '#6A0DAD' } : { backgroundColor: '#fff' }]} 
          onPress={animateToBus}
        >
          <MaterialCommunityIcons 
             name="crosshairs-gps" 
             size={28} 
             color={isFollowing ? "#fff" : "#6A0DAD"} 
          />
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
  uiOverlay: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
  },
  iconButton: {
    backgroundColor: '#fff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  pulse: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(106, 13, 173, 0.3)' },
  markerCore: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#6A0DAD', position: 'absolute', top: 5, left: 5, borderWidth: 2, borderColor: '#fff' },
  stopMarker: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', borderWidth: 2, borderColor: '#4A90E2', justifyContent: 'center', alignItems: 'center' },
  stopMarkerInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4A90E2' },
  backButton: { 
    flexDirection: 'row',
    backgroundColor: '#6A0DAD', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 30, 
    elevation: 5,
    alignItems: 'center',
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
