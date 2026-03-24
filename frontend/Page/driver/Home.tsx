import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import api from "../../services/api";
import { auth } from "../../firebaseConfig";

export default function Home({ navigation }: any) {
  const [tracking, setTracking] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTracking = async () => {
    try {
      if (tracking) {
        Alert.alert("Already Tracking", "Location tracking is already running.");
        return;
      }

      setLoading(true);

      // 1. Get Location Permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Allow location access to start tracking.");
        setLoading(false);
        return;
      }

      // 2. Fetch today's trip to find the active/scheduled one
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Auth Error", "Session expired. Please login again.");
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const response = await api.get("/api/driver/trips/today", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trips = response.data.trips || [];
      const trip = trips.find((t: any) => t.status === "scheduled" || t.status === "active");

      if (!trip) {
        Alert.alert("No Trip Found", "You do not have a scheduled trip for today.");
        setLoading(false);
        return;
      }

      const tripId = trip.id;
      setActiveTripId(tripId);

      // 3. Start trip on backend
      await api.post(`/api/driver/trips/${tripId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 4. Start Location Pinging
      setTracking(true);
      Alert.alert("Success", "Location tracking started");

      intervalRef.current = setInterval(async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          await api.post(
            `/api/driver/trips/${tripId}/ping-location`,
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              speedKph: location.coords.speed && location.coords.speed > 0 ? location.coords.speed * 3.6 : 0,
              headingDeg: location.coords.heading || 0,
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } catch (error) {
          console.error("Location ping failed", error);
        }
      }, 5000);

    } catch (error) {
      console.error("Start tracking failed", error);
      Alert.alert("Error", "Failed to start location tracking.");
    } finally {
      setLoading(false);
    }
  };

  const stopTracking = async () => {
    try {
      if (!tracking) {
        Alert.alert("Not Tracking", "Location tracking is not currently running.");
        return;
      }

      setLoading(true);

      // 1. Stop interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTracking(false);

      // 2. Stop trip on backend
      if (activeTripId) {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          await api.post(`/api/driver/trips/${activeTripId}/stop`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setActiveTripId(null);
      }

      Alert.alert("Success", "Location tracking stopped");
    } catch (error) {
      console.error("Stop tracking failed", error);
      Alert.alert("Error", "Failed to stop location tracking.");
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
        <Text style={styles.header}>Driver Dashboard</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4A0DAD" />
        ) : (
          <>
            <Pressable
              style={[styles.button, tracking && styles.buttonDisabled]}
              onPress={startTracking}
              disabled={tracking}
            >
              <Text style={styles.buttonText}>{tracking ? "Tracking..." : "Start"}</Text>
            </Pressable>

            <Pressable
              style={[styles.button, !tracking && styles.buttonDisabled]}
              onPress={stopTracking}
              disabled={!tracking}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </Pressable>
          </>
        )}

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("MyRoute")}
        >
          <Text style={styles.buttonText}>My Route</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("TodaySchedule")}
        >
          <Text style={styles.buttonText}>Today Schedule</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("PassengerInfo")}
        >
          <Text style={styles.buttonText}>Passenger Info</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => {
            if (tracking) {
              Alert.alert("Warning", "Please stop tracking before leaving the dashboard.");
              return;
            }
            auth.signOut().then(() => {
              navigation.navigate("Home");
            });
          }}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#65218fff",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#4A0DAD",
    alignItems: "center",
    marginVertical: 10,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#999",
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
