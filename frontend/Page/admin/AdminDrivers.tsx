import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Alert, ScrollView } from "react-native";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.5:3000";

export default function AdminDrivers({ navigation }: any) {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nic, setNic] = useState("");
    const [license, setLicense] = useState("");

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get(`${BASE_URL}/api/admin/drivers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrivers(res.data || []);
        } catch (err) {
            console.log("Error fetching drivers");
        }
    };

    const addDriver = async () => {
        if (!username || !email || !password || !nic || !license) {
            Toast.show({ type: "error", text1: "Error", text2: "All fields are required" });
            return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.post(`${BASE_URL}/api/admin/drivers`, {
                username,
                email,
                password,
                NICNumber: nic,
                LicenseNumber: license
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUsername("");
            setEmail("");
            setPassword("");
            setNic("");
            setLicense("");
            fetchDrivers();
            Toast.show({ type: "success", text1: "Success", text2: "Driver added successfully" });
        } catch (err: any) {
            console.error(err);
            Toast.show({ type: "error", text1: "Error", text2: err.response?.data?.message || "Failed to add driver" });
        }
    };

    const toggleDriverStatus = async (id: string, currentStatus: string) => {
        const isDisabled = currentStatus !== "disabled";
        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.put(`${BASE_URL}/api/admin/drivers/${id}/status`, {
                isDisabled
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDrivers();
            Toast.show({ type: "success", text1: "Success", text2: `Driver account ${isDisabled ? 'disabled' : 'enabled'}` });
        } catch (err) {
            Toast.show({ type: "error", text1: "Error", text2: "Failed to update driver status" });
        }
    };

    const deleteDriver = async (uid: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.delete(`${BASE_URL}/api/admin/drivers/${uid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDrivers();
            Toast.show({ type: "info", text1: "Deleted", text2: "Driver deleted successfully" });
        } catch (err) {
            console.error(err);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to delete driver" });
        }
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#6A0DAD" />
            </Pressable>
            <Text style={styles.title}>👨‍✈️ Driver Management</Text>

            <View style={styles.form}>
                <TextInput placeholder="Driver Name" value={username} onChangeText={setUsername} style={styles.input} />
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
                <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
                <TextInput placeholder="NIC Number" value={nic} onChangeText={setNic} style={styles.input} />
                <TextInput placeholder="License Number" value={license} onChangeText={setLicense} style={styles.input} />
                <Pressable style={styles.addBtn} onPress={addDriver}>
                    <Text style={styles.btnText}>Add Driver</Text>
                </Pressable>
            </View>

            <FlatList
                data={drivers}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <View style={styles.driverCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.driverText}>{item.username} ({item.LicenseNumber})</Text>
                            <Text style={styles.subText}>{item.email}</Text>
                            <Text style={styles.statusText}>Status: {item.status || "active"}</Text>
                        </View>
                        <View style={styles.actionColumn}>
                            <Pressable
                                style={[styles.statusBtn, item.status === "disabled" ? styles.enableBtn : styles.disableBtn]}
                                onPress={() => toggleDriverStatus(item.uid, item.status)}>
                                <Text style={styles.actionText}>{item.status === 'disabled' ? 'Enable' : 'Disable'}</Text>
                            </Pressable>
                            <Pressable onPress={() => deleteDriver(item.uid)} style={styles.deleteBtn}>
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
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#6A0DAD" },
    form: { backgroundColor: "white", padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 10, marginBottom: 8 },
    addBtn: { backgroundColor: "#6A0DAD", padding: 12, borderRadius: 12, alignItems: "center", marginTop: 5 },
    btnText: { color: "white", fontWeight: "bold" },
    driverCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 8, elevation: 2, justifyContent: "space-between" },
    driverText: { fontSize: 16, fontWeight: "bold" },
    subText: { color: "#666", marginTop: 2, fontSize: 13 },
    statusText: { fontSize: 13, color: "#888", marginTop: 2 },
    actionColumn: { alignItems: "flex-end" },
    statusBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, marginBottom: 8 },
    enableBtn: { backgroundColor: "#28a745" },
    disableBtn: { backgroundColor: "#dc3545" },
    actionText: { color: "white", fontSize: 12, fontWeight: "bold" },
    deleteBtn: { paddingVertical: 4, paddingHorizontal: 10 },
    delete: { color: "red", fontWeight: "bold", fontSize: 13 },
});
