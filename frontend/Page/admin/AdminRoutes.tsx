import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function AdminRoutes({ navigation }: any) {
    const [routes, setRoutes] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [stops, setStops] = useState("");

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get(`${BASE_URL}/api/admin/routes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoutes(res.data.data || []);
        } catch (err) {
            console.log("Error fetching routes");
        }
    };

    const addRoute = async () => {
        if (!name || !stops) {
            Alert.alert("Error", "Name and stops required");
            return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            const st = stops.split(",").map(stop => ({ name: stop.trim(), lat: 0, lng: 0 }));

            await axios.post(`${BASE_URL}/api/admin/routes`, {
                name,
                stops: st,
                description: "Added from Admin Panel"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setName("");
            setStops("");
            fetchRoutes();
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to add route");
        }
    };

    const deleteRoute = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.delete(`${BASE_URL}/api/admin/routes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoutes();
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to delete route");
        }
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#6A0DAD" />
            </Pressable>
            <Text style={styles.title}>🛣 Route Management</Text>

            <View style={styles.form}>
                <TextInput
                    placeholder="Route Name (e.g. 138 - Pettah)"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Stops (Comma separated: Pettah, TownHall)"
                    value={stops}
                    onChangeText={setStops}
                    style={styles.input}
                />
                <Pressable style={styles.addBtn} onPress={addRoute}>
                    <Text style={styles.btnText}>Add Route</Text>
                </Pressable>
            </View>

            <FlatList
                data={routes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.routeCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.routeText}>{item.name}</Text>
                            <Text style={styles.stopsText}>
                                Stops: {item.stops.map((s: any) => s.name).join(", ")}
                            </Text>
                        </View>
                        <Pressable onPress={() => deleteRoute(item.id)}>
                            <MaterialCommunityIcons name="trash-can" size={24} color="red" />
                        </Pressable>
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
    addBtn: { backgroundColor: "#6A0DAD", padding: 12, borderRadius: 12, alignItems: "center" },
    btnText: { color: "white", fontWeight: "bold" },
    routeCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 8, elevation: 2 },
    routeText: { fontSize: 16, fontWeight: "bold" },
    stopsText: { color: "#666", marginTop: 5, fontSize: 12 }
});
