import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import * as Location from 'expo-location';
import axios from "axios";
import { auth } from "../../firebaseConfig";
import Toast from 'react-native-toast-message';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.5:3000";

export default function SearchRoute({ navigation }: any) {
  const [buses, setBuses] = useState<any[]>([]);
  const [allStops, setAllStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState<any>(null);
  const [to, setTo] = useState<any>(null);

  useEffect(() => {
    fetchBackendStops();
  }, []);

  useEffect(() => {
    if (from && to) fetchAvailableBuses();
  }, [from, to]);

  const fetchBackendStops = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/api/passenger/stops`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formatted = res.data.stops.map((s: any) => ({
        label: s.name,
        value: s
      }));
      setAllStops(formatted);
      console.log(`[FRONTEND] Fetched ${formatted.length} stops from backend successfully.`);
    } catch (err) {
      console.log("[FRONTEND] Error fetching backend stops", err);
    }
  };

  const findNearestStop = async () => {
    if (allStops.length === 0) {
       Alert.alert("Hold on", "Waiting for database stops to load...");
       return;
    }
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is required for GPS matching.");
        return;
      }

      let userLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      let minDistance = Infinity;
      let nearestStopObj: any = null;

      allStops.forEach((stopItem) => {
        const stop = stopItem.value;
        const dist = calculateDistance(userLoc.coords.latitude, userLoc.coords.longitude, stop.lat, stop.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestStopObj = stop;
        }
      });

      if (nearestStopObj) {
        setFrom(nearestStopObj);
        Toast.show({ type: 'success', text1: `Nearest Stop Verified: ${nearestStopObj.name}` });
      }
    } catch (error) {
      console.error("Location Error:", error);
      Alert.alert("Error", "GPS Signal not strong enough to pinpoint.");
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
    if (!from || !to) return;
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        Alert.alert("Auth Error", "Your session token is active. Please re-login.");
        return;
      }
      
      console.log(`[FRONTEND] Searching routes from ${from.name} to ${to.name}...`);
      const response = await axios.get(`${BASE_URL}/api/passenger/search-buses`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { from: from.name, to: to.name, date: new Date().toISOString().split("T")[0] }
      });
      
      setBuses(response.data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Network Error", "Timeout confirming bus paths.");
    } finally { setLoading(false); }
  };

  const renderBus = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.busName}>Route {item.routeNumber || 'Direct'}</Text>
        <Text style={styles.busNo}>{item.plateNumber}</Text>
      </View>
      <Pressable style={styles.trackBtn} onPress={() => navigation.navigate("LiveMap", { 
        busId: item.id,
        start: from,
        end: to 
      })}>
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
          data={allStops}
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
        data={allStops.filter(s => s.value?.name !== from?.name)}
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
          keyExtractor={(item, index) => item.id || index.toString()}
          ListEmptyComponent={<Text style={styles.empty}>{from && to ? "No live buses found for this route" : "Select a route to view buses."}</Text>}
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
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginRight: 0 },
  dropdown: { flex: 1, backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#DDD", height: 55, width: "100%", marginBottom: 15 },
  gpsBtn: { backgroundColor: '#6A0DAD', padding: 15, borderRadius: 12, marginLeft: 10, height: 55, justifyContent: 'center', marginBottom: 15 },
  gpsIcon: { fontSize: 18 },
  card: { backgroundColor: "#FFF", padding: 15, borderRadius: 15, marginBottom: 15, elevation: 4, borderLeftWidth: 5, borderLeftColor: '#6A0DAD' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  busName: { fontWeight: "bold", fontSize: 17 },
  busNo: { color: '#6A0DAD', fontWeight: 'bold' },
  trackBtn: { backgroundColor: "#6A0DAD", padding: 12, borderRadius: 10, alignItems: "center" },
  trackBtnText: { color: "#FFF", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 50, color: "#999" }
});
