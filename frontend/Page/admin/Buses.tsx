import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import axios from "axios";
import { auth } from "../../firebaseConfig";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function Buses() {
  const [buses, setBuses] = useState<any[]>([]);
  const [busNumber, setBusNumber] = useState("");
  const [route, setRoute] = useState("");
  const [driver, setDriver] = useState("");

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${BASE_URL}/api/admin/buses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuses(res.data);
    } catch (err) {
      console.log("Error fetching buses", err);
    }
  };

  const addBus = async () => {
    if (!busNumber || !route) {
      Alert.alert("Error", "Bus number and route required");
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`${BASE_URL}/api/admin/buses`, {
        plateNumber: busNumber,
        routeNumber: route,
        driverLicense: driver,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBusNumber("");
      setRoute("");
      setDriver("");
      fetchBuses();
    } catch (err) {
      Alert.alert("Error", "Failed to add bus");
    }
  };

  const deleteBus = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.delete(`${BASE_URL}/api/admin/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBuses();
    } catch (err) {
      Alert.alert("Error", "Failed to delete bus");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚌 Bus Management</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Bus Number"
          value={busNumber}
          onChangeText={setBusNumber}
          style={styles.input}
        />
        <TextInput
          placeholder="Route"
          value={route}
          onChangeText={setRoute}
          style={styles.input}
        />
        <TextInput
          placeholder="Driver"
          value={driver}
          onChangeText={setDriver}
          style={styles.input}
        />

        <Pressable style={styles.addBtn} onPress={addBus}>
          <Text style={styles.btnText}>Add Bus</Text>
        </Pressable>
      </View>

      <FlatList
        data={buses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.busCard}>
            <Text style={styles.busText}>
              {item.plateNumber} — Route: {item.routeNumber}
            </Text>
            <Pressable onPress={() => deleteBus(item._id)}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  form: { backgroundColor: "white", padding: 15, borderRadius: 15, marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: "#6A0DAD",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
  busCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  busText: { fontSize: 16 },
  delete: { color: "red", fontWeight: "bold" },
});