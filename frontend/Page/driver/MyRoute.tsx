import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { auth } from "../../firebaseConfig";

interface Stop {
  name: string;
  lat: number;
  lng: number;
}

interface Trip {
  id: string;
  routeNumber: string;
  status: string;
  stops?: Stop[];
}

export default function RouteScreen({ navigation }: any) {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveRoute();
  }, []);

  const fetchActiveRoute = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await api.get("/api/driver/trips/today", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const trips: Trip[] = response.data.trips || [];

      // Find the first active or scheduled trip
      const activeTrip = trips.find(t => t.status === "active") || trips.find(t => t.status === "scheduled");

      if (activeTrip) {
        setCurrentTrip(activeTrip);
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
    } finally {
      setLoading(false);
    }
  };

  const routeName = currentTrip?.stops && currentTrip.stops.length >= 2
    ? `${currentTrip.stops[0].name} → ${currentTrip.stops[currentTrip.stops.length - 1].name}`
    : currentTrip?.routeNumber || "No Active Route";

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#bbb1c6ff", "#9634d2ff"]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>My Route</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4A0DAD" />
        ) : currentTrip ? (
          <View style={styles.card}>
            <Text style={styles.routeHeader}>{routeName}</Text>
            <View style={styles.busStops}>
              {currentTrip.stops && currentTrip.stops.length > 0 ? (
                currentTrip.stops.map((stop, index) => (
                  <Text key={index} style={styles.stopText}>• {stop.name}</Text>
                ))
              ) : (
                <Text style={styles.stopText}>No stops defined for this route.</Text>
              )}
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>No route assigned for today.</Text>
        )}

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate("DriverHome")}
        >
          <Text style={styles.backButtonText}>BACK</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#65218fff",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    marginBottom: 30,
    elevation: 5,
  },
  routeHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A0DAD",
    marginBottom: 15,
    textAlign: "center",
  },
  busStops: {
    marginLeft: 10,
  },
  stopText: {
    fontSize: 18,
    color: "#333",
    marginVertical: 4,
  },
  noDataText: {
    fontSize: 18,
    color: "#fff",
    marginVertical: 20,
  },
  backButton: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#4A0DAD",
    alignItems: "center",
    marginVertical: 10,
    elevation: 3,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
