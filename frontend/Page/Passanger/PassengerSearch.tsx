import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000");

export default function PassengerSearch({ navigation }: any) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!start.trim() || !end.trim()) {
      Alert.alert("Input Required", "Please enter both start and end locations.");
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${BASE_URL}/api/maps/route-search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { start, end }
      });

      // Navigate to RouteMap with the search results
      navigation.navigate("RouteMap", { 
        routeData: response.data 
      });

    } catch (error: any) {
      console.error("Search Error:", error);
      Alert.alert(
        "Search Failed",
        error.response?.data?.message || "Could not find a route. Please try different locations."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={["#6A0DAD", "#4c669f"]}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.container}>
            <Pressable 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            </Pressable>

            <View style={styles.headerContainer}>
              <MaterialCommunityIcons name="map-marker-distance" size={60} color="#fff" />
              <Text style={styles.title}>Find Your Route</Text>
              <Text style={styles.subtitle}>Enter locations to see path and bus stops</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="circle-outline" size={20} color="#6A0DAD" />
                  <View style={styles.dottedLine} />
                  <MaterialCommunityIcons name="map-marker" size={24} color="#FF3B30" />
                </View>

                <View style={styles.inputs}>
                  <TextInput
                    style={styles.input}
                    placeholder="Start Location (e.g., Colombo)"
                    placeholderTextColor="#999"
                    value={start}
                    onChangeText={setStart}
                  />
                  <View style={styles.separator} />
                  <TextInput
                    style={styles.input}
                    placeholder="End Location (e.g., Kandy)"
                    placeholderTextColor="#999"
                    value={end}
                    onChangeText={setEnd}
                  />
                </View>
              </View>

              <Pressable 
                style={[styles.searchButton, loading && styles.buttonDisabled]} 
                onPress={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
                    <Text style={styles.searchButtonText}>Search Route</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  inputGroup: {
    flexDirection: "row",
    marginBottom: 24,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginRight: 15,
  },
  dottedLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#EEE",
    marginVertical: 4,
  },
  inputs: {
    flex: 1,
  },
  input: {
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 10,
  },
  searchButton: {
    backgroundColor: "#6A0DAD",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A084CF",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
