import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.5:3000";

export default function AdminPassengers({ navigation }: any) {
    const [passengers, setPassengers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPassengers();
    }, []);

    const fetchPassengers = async () => {
        try {
            setLoading(true);
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get(`${BASE_URL}/api/admin/passengers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPassengers(res.data);
        } catch (err) {
            console.log("Error fetching passengers", err);
            Alert.alert("Error", "Could not load passengers");
        } finally {
            setLoading(false);
        }
    };

    const deletePassenger = async (id: string, name: string) => {
        Alert.alert("Confirm Delete", `Are you sure you want to delete ${name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const token = await auth.currentUser?.getIdToken();
                        await axios.delete(`${BASE_URL}/api/admin/passengers/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        fetchPassengers();
                    } catch (err) {
                        Alert.alert("Error", "Failed to delete passenger");
                    }
                }
            }
        ]);
    };

    return (
        <LinearGradient colors={["#9c98a1ff", "#bf35f1ff"]} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
                </Pressable>
                <Text style={styles.title}>Manage Passengers</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={passengers}
                    keyExtractor={(item) => item.uid}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View>
                                <Text style={styles.name}>{item.username}</Text>
                                <Text style={styles.email}>{item.email}</Text>
                            </View>
                            <Pressable onPress={() => deletePassenger(item.uid, item.username)} style={styles.deleteBtn}>
                                <MaterialCommunityIcons name="delete" size={24} color="#ff4d4d" />
                            </Pressable>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No passengers found.</Text>}
                />
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    backBtn: { marginRight: 15 },
    title: { fontSize: 24, fontWeight: "bold", color: "white" },
    card: { backgroundColor: "white", padding: 15, borderRadius: 15, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", elevation: 3 },
    name: { fontSize: 18, fontWeight: "bold", color: "#6A0DAD" },
    email: { fontSize: 14, color: "#666", marginTop: 4 },
    deleteBtn: { padding: 5 },
    empty: { textAlign: "center", color: "white", fontSize: 16, marginTop: 40 }
});
