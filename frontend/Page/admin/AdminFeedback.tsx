import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.5:3000";

export default function AdminFeedback({ navigation }: any) {
    const [feedbackList, setFeedbackList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await axios.get(`${BASE_URL}/api/admin/feedback`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedbackList(res.data);
        } catch (err) {
            console.log("Error fetching feedback", err);
            Alert.alert("Error", "Could not load feedback");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <MaterialCommunityIcons
                key={i}
                name="star"
                size={20}
                color={i < rating ? "#FFD700" : "#ddd"}
            />
        ));
    };

    return (
        <LinearGradient colors={["#9c98a1ff", "#bf35f1ff"]} style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
                </Pressable>
                <Text style={styles.title}>Passenger Feedback</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="white" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={feedbackList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.ratingRow}>
                                {renderStars(item.rating || 0)}
                            </View>
                            <Text style={styles.feedbackText}>"{item.feedback}"</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No feedback found.</Text>}
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
    card: { backgroundColor: "white", padding: 15, borderRadius: 15, marginBottom: 12, elevation: 3 },
    ratingRow: { flexDirection: "row", marginBottom: 8 },
    feedbackText: { fontSize: 16, color: "#333", fontStyle: "italic" },
    empty: { textAlign: "center", color: "white", fontSize: 16, marginTop: 40 }
});
