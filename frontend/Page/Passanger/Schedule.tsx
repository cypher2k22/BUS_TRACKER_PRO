import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function Schedule({ navigation }: any) {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${BASE_URL}/api/passenger/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuses(res.data.buses || []);
    } catch (err) {
      console.log("Error fetching schedule", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#bbb1c6ff", "#9634d2ff"]} style={StyleSheet.absoluteFill} />

      <View style={styles.container}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </Pressable>

        <Text style={styles.header}>TODAY'S SCHEDULE</Text>
        <Text style={styles.subheader}>All buses active or scheduled for today</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={buses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.busNo}>{item.plateNumber} — {item.routeNumber}</Text>
                <Text style={styles.timeText}>
                  Time: {item.starttime || "TBA"} - {item.endtime || "TBA"}
                </Text>
                <Text style={styles.status}>Status: {item.status}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No buses scheduled today.</Text>}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 15 },
  header: { fontSize: 32, fontWeight: "bold", color: "#65218fff", textAlign: "center", marginBottom: 5 },
  subheader: { fontSize: 16, color: "#fff", textAlign: "center", marginBottom: 20 },
  listContent: { paddingBottom: 30 },
  card: { backgroundColor: "rgba(255,255,255,0.9)", padding: 15, borderRadius: 15, marginBottom: 15, elevation: 4 },
  busNo: { fontSize: 18, fontWeight: "bold", color: "#6A0DAD", marginBottom: 5 },
  timeText: { fontSize: 15, color: "#444", marginBottom: 3 },
  status: { fontSize: 14, color: "#888", fontWeight: "bold", textTransform: "capitalize" },
  empty: { textAlign: "center", color: "#fff", fontSize: 16, marginTop: 40 }
});
