import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { auth } from "../../firebaseConfig";

interface Trip {
  id: string;
  routeNumber: string;
  starttime: string;
  endtime: string;
  stops?: any[];
}

export default function ScheduleScreen({ navigation }: any) {
  const [schedule, setSchedule] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
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

      setSchedule(response.data.trips || []);
    } catch (error) {
      console.error("Failed to fetch today's trips:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#bbb1c6ff", "#9634d2ff"]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Today's Schedule</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4A0DAD" />
        ) : schedule.length > 0 ? (
          schedule.map((item, index) => {
            // Determine route name based on stops if available
            let routeName = item.routeNumber;
            if (item.stops && item.stops.length >= 2) {
              const origin = item.stops[0].name;
              const dest = item.stops[item.stops.length - 1].name;
              routeName = `${origin} → ${dest}`;
            }

            return (
              <View key={item.id || index} style={styles.card}>
                <View>
                  <Text style={styles.timeText}>{item.starttime || "TBD"}</Text>
                  <Text style={styles.routeText}>{routeName}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No trips scheduled for today</Text>
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
    fontSize: 36,
    fontWeight: "bold",
    color: "#65218fff",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    marginBottom: 15,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A0DAD",
  },
  routeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginTop: 4,
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
    marginTop: 20,
    elevation: 3,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
