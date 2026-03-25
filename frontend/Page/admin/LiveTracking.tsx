import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function LiveTracking({ navigation }: any) {
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any>(null);

  useEffect(() => {
    fetchLiveBuses();
    const interval = setInterval(fetchLiveBuses, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedBus) {
      const updatedBus = liveBuses.find(b => b.busId === selectedBus.busId);
      if (updatedBus && (updatedBus.lat !== selectedBus.lat || updatedBus.lng !== selectedBus.lng)) {
        setSelectedBus(updatedBus);
      }
    }
  }, [liveBuses]);

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

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={{
            latitude: selectedBus ? selectedBus.lat : (liveBuses.length > 0 ? liveBuses[0].lat : 6.9271),
            longitude: selectedBus ? selectedBus.lng : (liveBuses.length > 0 ? liveBuses[0].lng : 79.8612),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {liveBuses.map((bus) => (
            <Marker
              key={bus.busId}
              coordinate={{ latitude: bus.lat, longitude: bus.lng }}
              title={`Bus: ${bus.busNumber || bus.busId}`}
              description={`Speed: ${bus.speed || 0} km/h`}
              pinColor={selectedBus?.busId === bus.busId ? "blue" : "red"}
            />
          ))}
        </MapView>
      </View>

      <FlatList
        data={liveBuses}
        keyExtractor={(item) => item.busId}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, selectedBus?.busId === item.busId && styles.selectedCard]}
            onPress={() => setSelectedBus(item)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="bus-side" size={24} color="#6A0DAD" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.bus}>{item.busNumber ? `Bus ${item.busNumber}` : "Unknown Bus"}</Text>
                <Text style={styles.subText}>Speed: {item.speed || 0} km/h</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={selectedBus?.busId === item.busId ? "blue" : "#ccc"} />
          </Pressable>
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
  mapContainer: {
    height: Dimensions.get("window").height * 0.4,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
  },
  map: { width: "100%", height: "100%" },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 8,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "blue",
    backgroundColor: "#f0f8ff"
  },
  bus: { fontSize: 16, fontWeight: "bold", color: "#333" },
  subText: { fontSize: 13, color: "#666", marginTop: 2 },
});