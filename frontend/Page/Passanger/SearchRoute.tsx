import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';
import axios from "axios";
import { auth } from "../../firebaseConfig";
import Toast from 'react-native-toast-message';


const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Ensure coordinates are included for the GPS "Nearest Stop" feature
const BUS_STOPS = [
  { label: 'Pettah', value: 'Pettah', lat: 6.9344, lng: 79.8531 },
  { label: 'Maharagama', value: 'Maharagama', lat: 6.8483, lng: 79.9265 },
  { label: 'Mattegoda', value: 'Mattegoda', lat: 6.8123, lng: 79.9542 },
  { label: 'Kottawa', value: 'Kottawa', lat: 6.8412, lng: 79.9654 },
];

export default function SearchRoute({ navigation }: any) {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  // Auto-search logic when both fields are selected
  useEffect(() => {
    if (from && to) fetchAvailableBuses();
  }, [from, to]);

  const findNearestStop = async () => {
  try {
    // 1. Request Permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Go to Settings to allow location access.");
      return;
    }

    // 2. Get GPS Position
    let userLoc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, // Use High accuracy to avoid "Pettah" default
    });

    // 3. Reverse Geocode (Turn coordinates into a City name)
    let geo = await Location.reverseGeocodeAsync({
      latitude: userLoc.coords.latitude,
      longitude: userLoc.coords.longitude,
    });

    if (geo.length > 0) {
      const detectedCity = geo[0].city || geo[0].district || geo[0].subregion;
      console.log("Detected City:", detectedCity);

      // 4. Try to find an exact match in your BUS_STOPS list
      const matched = BUS_STOPS.find(
        (stop) => stop.value.toLowerCase() === detectedCity?.toLowerCase()
      );

      if (matched) {
        setFrom(matched.value); // Set to detected city (e.g. "Mattegoda")
        Toast.show({ type: 'success', text1: `Nearest Stop: ${matched.value}` });
      } else {
        // Fallback: If city name doesn't match, use the closest coordinates
        let minDistance = Infinity;
        let nearest = null;

        BUS_STOPS.forEach((stop) => {
          const dist = calculateDistance(
            userLoc.coords.latitude,
            userLoc.coords.longitude,
            stop.lat,
            stop.lng
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearest = stop.value;
          }
        });

        if (nearest) {
          setFrom(nearest);
          Toast.show({ type: 'info', text1: `Located near ${nearest}` });
        }
      }
    }
  } catch (error) {
    console.error("Location Error:", error);
    Alert.alert("Error", "Could not detect your location.");
  }
};


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const fetchAvailableBuses = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${BASE_URL}/api/passenger/search-buses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { from, to, date: new Date().toISOString().split("T")[0] }
      });
      setBuses(response.data.buses || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally { setLoading(false); }
  };

  const renderBus = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.busName}>{item.busName}</Text>
        <Text style={styles.busNo}>{item.busNo}</Text>
      </View>
      <Pressable style={styles.trackBtn} onPress={() => navigation.navigate("LiveMap", { busId: item.id })}>
        <Text style={styles.trackBtnText}>Track Live Location</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Your Bus</Text>
      
      <View style={styles.inputRow}>
        <Dropdown
          style={styles.dropdown}
          data={BUS_STOPS}
          search
          labelField="label"
          valueField="value"
          placeholder="Starting From..."
          value={from}
          onChange={item => setFrom(item.value)}
        />
        <Pressable style={styles.gpsBtn} onPress={findNearestStop}>
          <Text style={styles.gpsIcon}>📍</Text>
        </Pressable>
      </View>

      <Dropdown
        style={styles.dropdown}
        data={BUS_STOPS.filter(s => s.value !== from)}
        search
        labelField="label"
        valueField="value"
        placeholder="Going To..."
        value={to}
        onChange={item => setTo(item.value)}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6A0DAD" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={buses}
          renderItem={renderBus}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.empty}>Select a route to find moving buses.</Text>}
        />
      )}
      <Pressable style={[styles.trackBtn, { marginTop: 20 }]} onPress={() => navigation.goBack()}>
        <Text style={styles.trackBtnText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8F9FA", paddingTop: 60 },
  header: { fontSize: 24, fontWeight: "bold", color: "#6A0DAD", marginBottom: 25 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginRight: 40 },
  dropdown: { 
    backgroundColor: "#FFF", 
    borderRadius: 12, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#DDD", 
    height: 55, // Set fixed height to fix the UI issue in your image
    marginBottom: 15,
    width: '100%',
    flex: 0 // Prevents the dropdown from taking up all available space
  },
  gpsBtn: { backgroundColor: '#6A0DAD', padding: 15, borderRadius: 12, marginLeft: 10, height: 55, justifyContent: 'center' },
  gpsIcon: { fontSize: 18 },
  card: { backgroundColor: "#FFF", padding: 15, borderRadius: 15, marginBottom: 15, elevation: 4, borderLeftWidth: 5, borderLeftColor: '#6A0DAD' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  busName: { fontWeight: "bold", fontSize: 17 },
  busNo: { color: '#6A0DAD', fontWeight: 'bold' },
  trackBtn: { backgroundColor: "#6A0DAD", padding: 12, borderRadius: 10, alignItems: "center" },
  trackBtnText: { color: "#FFF", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 50, color: "#999" }
});
