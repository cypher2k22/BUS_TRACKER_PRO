import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function AdminRoutes({ navigation }: any) {
    const [routes, setRoutes] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [startLocation, setStartLocation] = useState("");
    const [endLocation, setEndLocation] = useState("");
    const [detectedStops, setDetectedStops] = useState<any[]>([]);
    const [polyline, setPolyline] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRoutes();
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
            console.log("Error fetching buses");
        }
    };

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

    const detectStops = async () => {
        if (!startLocation.trim() || !endLocation.trim()) {
            Toast.show({ type: "error", text1: "Required", text2: "Enter start and end locations" });
            return;
        }

        setLoading(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.post(`${BASE_URL}/api/admin/detect-stops`, {
                start: startLocation,
                end: endLocation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDetectedStops(res.data.stops);
            setPolyline(res.data.polyline);
            if (!name) setName(`${startLocation} - ${endLocation}`);
            Toast.show({ type: "success", text1: "Stops Detected", text2: `Found ${res.data.stops.length} potential stops.` });
        } catch (err: any) {
            console.error("❌ FRONTEND DETECT STOPS ERROR:", err.response?.data || err.message);
            Toast.show({ 
                type: "error", 
                text1: "Detection Failed", 
                text2: err.response?.data?.message || "Check API configuration" 
            });
        } finally {
            setLoading(false);
        }
    };

    const moveStop = (index: number, direction: 'up' | 'down') => {
        const newStops = [...detectedStops];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newStops.length) return;
        
        const temp = newStops[index];
        newStops[index] = newStops[targetIndex];
        newStops[targetIndex] = temp;
        setDetectedStops(newStops);
    };

    const removeStop = (index: number) => {
        const newStops = detectedStops.filter((_, i) => i !== index);
        setDetectedStops(newStops);
    };

    const addRoute = async () => {
        if (!name || detectedStops.length < 2) {
            Toast.show({ type: "error", text1: "Error", text2: "Route name and at least 2 stops required" });
            return;
        }

        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.post(`${BASE_URL}/api/admin/routes`, {
                name,
                stops: detectedStops,
                polyline,
                description: `From ${startLocation} to ${endLocation}`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setName("");
            setStartLocation("");
            setEndLocation("");
            setDetectedStops([]);
            setPolyline(null);
            fetchRoutes();
            Toast.show({ type: "success", text1: "Success", text2: "Route added successfully" });
        } catch (err) {
            console.error(err);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to add route" });
        }
    };

    const deleteRoute = async (id: string) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            await axios.delete(`${BASE_URL}/api/admin/routes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoutes();
            Toast.show({ type: "info", text1: "Deleted", text2: "Route deleted successfully" });
        } catch (err) {
            console.error(err);
            Toast.show({ type: "error", text1: "Error", text2: "Failed to delete route" });
        }
    };

    const renderDetectedStop = ({ item, index }: any) => (
        <View style={styles.stopItem}>
            <View style={styles.stopInfo}>
                <Text style={styles.stopIndex}>{index + 1}</Text>
                <Text style={styles.stopName} numberOfLines={1}>{item.name}</Text>
            </View>
            <View style={styles.stopActions}>
                <Pressable onPress={() => moveStop(index, 'up')} disabled={index === 0}>
                    <MaterialCommunityIcons name="chevron-up" size={24} color={index === 0 ? "#ccc" : "#6A0DAD"} />
                </Pressable>
                <Pressable onPress={() => moveStop(index, 'down')} disabled={index === detectedStops.length - 1}>
                    <MaterialCommunityIcons name="chevron-down" size={24} color={index === detectedStops.length - 1 ? "#ccc" : "#6A0DAD"} />
                </Pressable>
                <Pressable onPress={() => removeStop(index)}>
                    <MaterialCommunityIcons name="close-circle" size={24} color="#FF3B30" />
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#6A0DAD" />
            </Pressable>
            <Text style={styles.title}>🛣 Route Management</Text>

            <View style={styles.form}>
                <TextInput
                    placeholder="Starting Location (e.g. Pettah)"
                    value={startLocation}
                    onChangeText={setStartLocation}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Ending Location (e.g. Kottawa)"
                    value={endLocation}
                    onChangeText={setEndLocation}
                    style={styles.input}
                />
                
                <Pressable 
                    style={[styles.detectBtn, loading && styles.disabledBtn]} 
                    onPress={detectStops}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Detect Stops via Google Maps</Text>}
                </Pressable>

                {detectedStops.length > 0 && (
                    <View style={styles.stopsPreview}>
                        <TextInput
                            placeholder="Route Display Name"
                            value={name}
                            onChangeText={setName}
                            style={[styles.input, { marginTop: 15 }]}
                        />
                        <Text style={styles.sectionLabel}>Detected Stops ({detectedStops.length})</Text>
                        <View style={{ maxHeight: 200, marginVertical: 10 }}>
                            <FlatList
                                data={detectedStops}
                                renderItem={renderDetectedStop}
                                keyExtractor={(item, index) => `${item.id}-${index}`}
                                nestedScrollEnabled={true}
                            />
                        </View>
                        <Pressable style={styles.addBtn} onPress={addRoute}>
                            <Text style={styles.btnText}>Save Optimized Route</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            <Text style={styles.listHeader}>Existing Routes</Text>
            <FlatList
                data={routes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const assignedBusesCount = buses.filter(b => b.routeNumber === item.name || String(b.routeId) === String(item.id)).length;
                    return (
                        <View style={styles.routeCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.routeText}>{item.name}</Text>
                                <Text style={styles.stopsText}>
                                    Stops: {item.stops?.map((s: any) => s.name).join(", ")}
                                </Text>
                                <Text style={styles.busIndicator}>
                                    <MaterialCommunityIcons name="bus" size={12} color="#888" /> {assignedBusesCount} buses assigned
                                </Text>
                            </View>
                            <Pressable onPress={() => deleteRoute(item.id)}>
                                <MaterialCommunityIcons name="trash-can" size={24} color="red" />
                            </Pressable>
                        </View>
                    )
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, paddingTop: 50, backgroundColor: "#F8F9FA" },
    backBtn: { marginBottom: 10 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15, color: "#6A0DAD" },
    form: { backgroundColor: "white", padding: 15, borderRadius: 15, marginBottom: 15, elevation: 3 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, marginBottom: 8 },
    detectBtn: { backgroundColor: "#FF9500", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 5 },
    addBtn: { backgroundColor: "#6A0DAD", padding: 12, borderRadius: 12, alignItems: "center" },
    disabledBtn: { opacity: 0.6 },
    btnText: { color: "white", fontWeight: "bold" },
    sectionLabel: { fontSize: 14, fontWeight: "bold", color: "#666", marginTop: 10 },
    stopsPreview: { borderTopWidth: 1, borderTopColor: "#EEE", marginTop: 10 },
    stopItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
    stopInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
    stopIndex: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#EEE", textAlign: "center", lineHeight: 24, fontSize: 12, marginRight: 10, color: "#666" },
    stopName: { fontSize: 14, color: "#333", flex: 1 },
    stopActions: { flexDirection: "row", alignItems: "center", gap: 5 },
    listHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" },
    routeCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 8, elevation: 2 },
    routeText: { fontSize: 16, fontWeight: "bold" },
    stopsText: { color: "#666", marginTop: 5, fontSize: 12 },
    busIndicator: { color: "#888", marginTop: 3, fontSize: 12, fontStyle: "italic" }
});
