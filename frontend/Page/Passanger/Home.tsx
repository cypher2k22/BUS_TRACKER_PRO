import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, FlatList, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.5:3000";

export default function Home({ navigation }: any) {
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveBuses();
    const interval = setInterval(fetchLiveBuses, 500); // Update every half second
    return () => clearInterval(interval);
  }, []);

  const fetchLiveBuses = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/api/passenger/live-buses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveBuses(res.data.data || []);
    } catch (err) {
      console.error("Error fetching live buses:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderLiveBus = ({ item }: any) => (
    <Pressable 
      style={styles.busCard} 
      onPress={() => navigation.navigate("LiveMap", { busId: item.tripId })}
    >
      <View style={styles.busInfo}>
        <MaterialCommunityIcons name="bus-side" size={24} color="#6A0DAD" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.busNumber}>{item.busNumber}</Text>
          <Text style={styles.routeText}>{item.routeNumber}</Text>
        </View>
      </View>
      <View style={styles.trackTag}>
        <Text style={styles.trackTagText}>LIVE</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#bbb1c6ff", "#9634d2ff"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Welcome to Bus Tracker Pro</Text>
        <Text style={styles.subheader}>
          Find and track your bus in real-time
        </Text>

        <View style={styles.mainActions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate("PassengerSearch")}
          >
            <MaterialCommunityIcons name="magnify" size={32} color="#fff" />
            <Text style={styles.buttonText}>Search Route</Text>
          </Pressable>
          
          <Pressable
            style={styles.actionButton}
            onPress={() => navigation.navigate("Schedule")}
          >
            <MaterialCommunityIcons name="calendar-clock" size={32} color="#fff" />
            <Text style={styles.buttonText}>Schedule</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Active Now</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <View style={styles.liveListContainer}>
            {liveBuses.length > 0 ? (
              liveBuses.map((bus) => (
                <View key={bus.tripId}>
                  {renderLiveBus({ item: bus })}
                </View>
              ))
            ) : (
              <Text style={styles.noLiveText}>No buses are currently active.</Text>
            )}
          </View>
        )}

        <Pressable
          style={styles.feedbackButton}
          onPress={() => navigation.navigate("Feedback")}
        >
          <Text style={styles.feedbackText}>Give Feedback</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#65218fff",
    textAlign: "center",
    marginBottom: 5,
  },
  subheader: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    width: "48%",
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: "rgba(106, 13, 173, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  liveListContainer: {
    marginBottom: 30,
  },
  busCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },
  busInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  busNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  routeText: {
    fontSize: 14,
    color: "#666",
  },
  trackTag: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  trackTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  noLiveText: {
    color: "#eee",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  feedbackButton: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  feedbackText: {
    color: "#fff",
    textDecorationLine: 'underline',
    fontSize: 16,
  }
});
