import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function LiveTracking({ navigation }: any) {
  const [liveBuses, setLiveBuses] = useState<any[]>([]);

  useEffect(() => {
    fetchLiveBuses();
    const interval = setInterval(fetchLiveBuses, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveBuses = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${BASE_URL}/api/admin/live`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveBuses(res.data);
    } catch (err) {
      console.log("Live tracking error", err);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#6A0DAD" />
      </Pressable>
      <Text style={styles.title}>📍 Live Bus Tracking</Text>

      <FlatList
        data={liveBuses}
        keyExtractor={(item) => item.busId}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.bus}>🚌 {item.busNumber || item.busId}</Text>
            <Text>Lat: {item.lat}</Text>
            <Text>Lng: {item.lng}</Text>
            <Text>Speed: {item.speed} km/h</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No live buses found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 50, backgroundColor: "#F8F9FA" },
  backBtn: { marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#6A0DAD" },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 8,
    elevation: 3,
  },
  bus: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#333" },
});