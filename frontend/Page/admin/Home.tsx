import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "../../firebaseConfig";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function Home({ navigation }: any) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await axios.get(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(res.data);
    } catch (err) {
      console.log("Admin stats error:", err);
      Alert.alert("Error", "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6A0DAD" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#9c98a1ff", "#bf35f1ff"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>🛠 Admin Control Panel</Text>

        <View style={styles.cardGrid}>
          <Card title="Total Buses" value={stats?.buses || 0} icon="bus" />
          <Card title="Drivers" value={stats?.drivers || 0} icon="account" />
          <Card title="Routes" value={stats?.routes || 0} icon="map-marker-path" />
          <Card title="Live Buses" value={stats?.live || 0} icon="radar" />
        </View>

        <View style={styles.actions}>
          <ActionBtn
            text="Manage Buses"
            icon="bus-cog"
            onPress={() => navigation.navigate("AdminBuses")}
          />
          <ActionBtn
            text="Manage Drivers"
            icon="account-group"
            onPress={() => navigation.navigate("AdminDrivers")}
          />
          <ActionBtn
            text="Manage Routes"
            icon="routes"
            onPress={() => navigation.navigate("AdminRoutes")}
          />
          <ActionBtn
            text="Live Tracking"
            icon="map-marker-radius"
            onPress={() => navigation.navigate("AdminLiveTracking")}
          />
        </View>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

function Card({ title, value, icon }: any) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name={icon} size={30} color="#6A0DAD" />
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

function ActionBtn({ text, icon, onPress }: any) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={26} color="white" />
      <Text style={styles.actionText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    backgroundColor: "white",
    width: "48%",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
    elevation: 6,
  },

  cardValue: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 6,
    color: "#6A0DAD",
  },

  cardTitle: {
    fontSize: 14,
    color: "#6A0DAD",
    marginTop: 3,
  },

  actions: {
    marginTop: 20,
  },

  actionBtn: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  actionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  logoutBtn: {
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 25,
    marginTop: 15,
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});