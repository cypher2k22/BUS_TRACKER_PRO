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
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.5:3000";

export default function Buses({ navigation }: any) {
  const [buses, setBuses] = useState<any[]>([]);
  const [busNumber, setBusNumber] = useState("");
  const [route, setRoute] = useState("");
  const [driver, setDriver] = useState("");
  const [capacity, setCapacity] = useState("");
  const [date, setDate] = useState("");
  const [starttime, setStarttime] = useState("");
  const [endtime, setEndtime] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [driversList, setDriversList] = useState<any[]>([]);
  const [routesList, setRoutesList] = useState<any[]>([]);

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${BASE_URL}/api/admin/routes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formattedRoutes = res.data.data.map((r: any) => ({
        label: r.name,
        value: r.name,
      }));
      setRoutesList(formattedRoutes);
    } catch (err) {
      console.log("Error fetching routes", err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.get(`${BASE_URL}/api/admin/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const formattedDrivers = res.data.map((d: any) => ({
        label: `${d.username} (${d.LicenseNumber})`,
        value: d.LicenseNumber,
      }));
      setDriversList(formattedDrivers);
    } catch (err) {
      console.log("Error fetching drivers", err);
    }
  };

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
    if (!busNumber || !route || !driver || !capacity || !date) {
      Toast.show({ type: "error", text1: "Error", text2: "All required fields must be filled" });
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`${BASE_URL}/api/admin/buses`, {
        plateNumber: busNumber,
        routeNumber: route,
        driverLicense: driver,
        capacity: Number(capacity),
        date,
        starttime,
        endtime,
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBusNumber("");
      setRoute("");
      setDriver("");
      setCapacity("");
      setDate("");
      setStarttime("");
      setEndtime("");
      setStatus("scheduled");
      fetchBuses();
      Toast.show({ type: "success", text1: "Success", text2: "Bus added successfully" });
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err.response?.data?.message || err.message || "Failed to add bus" });
    }
  };

  const toggleBusStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "deactivated" : "active";
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.put(`${BASE_URL}/api/admin/buses/${id}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBuses();
      Toast.show({ type: "success", text1: "Success", text2: `Bus is now ${newStatus}` });
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to update bus status" });
    }
  };

  const deleteBus = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.delete(`${BASE_URL}/api/admin/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBuses();
      Toast.show({ type: "info", text1: "Deleted", text2: "Bus deleted successfully" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to delete bus" });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={buses}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#6A0DAD" />
            </Pressable>
            <Text style={styles.title}>🚌 Bus Management</Text>

            <View style={styles.form}>
              <TextInput
                placeholder="Bus Number (Plate)"
                value={busNumber}
                onChangeText={setBusNumber}
                style={styles.input}
              />
              <TextInput
                placeholder="Capacity (Seats)"
                value={capacity}
                onChangeText={setCapacity}
                style={styles.input}
                keyboardType="numeric"
              />
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={routesList}
                labelField="label"
                valueField="value"
                placeholder="Select Route"
                value={route}
                onChange={(item) => {
                  setRoute(item.value);
                }}
              />
              <TextInput
                placeholder="Date (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                style={styles.input}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TextInput
                  placeholder="Start (08:00 AM)"
                  value={starttime}
                  onChangeText={setStarttime}
                  style={[styles.input, { width: '48%' }]}
                />
                <TextInput
                  placeholder="End (10:00 AM)"
                  value={endtime}
                  onChangeText={setEndtime}
                  style={[styles.input, { width: '48%' }]}
                />
              </View>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={[
                  { label: 'Scheduled', value: 'scheduled' },
                  { label: 'Active', value: 'active' },
                  { label: 'Deactivated', value: 'deactivated' },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select Status"
                value={status}
                onChange={(item) => {
                  setStatus(item.value);
                }}
              />
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={driversList}
                labelField="label"
                valueField="value"
                placeholder="Select Driver"
                value={driver}
                onChange={(item) => {
                  setDriver(item.value);
                }}
              />

              <Pressable style={styles.addBtn} onPress={addBus}>
                <Text style={styles.btnText}>Add Bus</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.busCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.busText}>
                {item.plateNumber} — Route: {item.routeNumber}
              </Text>
              <Text style={styles.statusText}>Status: {item.status || "scheduled"}</Text>
            </View>
            <View style={styles.actionColumn}>
              <Pressable
                style={[styles.statusBtn, item.status === "active" ? styles.deactivateBtn : styles.activateBtn]}
                onPress={() => toggleBusStatus(item._id, item.status)}>
                <Text style={styles.actionText}>{item.status === 'active' ? 'Deactivate' : 'Activate'}</Text>
              </Pressable>
              <Pressable onPress={() => deleteBus(item._id)} style={styles.deleteBtn}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 50, backgroundColor: "#F8F9FA" },
  backBtn: { marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  form: { backgroundColor: "white", padding: 15, borderRadius: 15, marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
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
  busText: { fontSize: 16, fontWeight: "bold" },
  statusText: { fontSize: 14, color: "#666", marginTop: 4 },
  actionColumn: { alignItems: "flex-end" },
  statusBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, marginBottom: 8 },
  activateBtn: { backgroundColor: "#28a745" },
  deactivateBtn: { backgroundColor: "#ffc107" },
  actionText: { color: "white", fontSize: 12, fontWeight: "bold" },
  deleteBtn: { paddingVertical: 4, paddingHorizontal: 10 },
  delete: { color: "red", fontWeight: "bold", fontSize: 13 },
});