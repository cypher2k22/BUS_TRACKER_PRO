import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

// This pulls the IP from your frontend/.env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function Signup({ route, navigation }: any) {

  // Get role from navigation params (default: passenger)
  const { role = "passenger" } = route.params || {};

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [busRoute, setBusRoute] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle signup button click
  const handleSignup = async () => {
    if (!username || !email || !password || (role === "driver" && (!busNumber || !busRoute))) {
      Alert.alert("Error", "Please fill all required fields!");
      return;
    }

    const payload = { username, email, password, role, busNumber, busRoute };

    try {
      setLoading(true);
      
      // ✅ Using Dynamic BASE_URL instead of .local address
      const SIGNUP_URL = `${BASE_URL}/api/auth/signup`;
      
      console.log("Attempting signup at:", SIGNUP_URL);

      const response = await axios.post(SIGNUP_URL, payload);

      Alert.alert("Success", "Account created successfully!");

      // --- NAVIGATION LOGIC ---
      if (role === "passenger") {
        navigation.replace("PassengerHome"); 
      } else if (role === "driver") {
        navigation.replace("DriverHome");
      } else if (role === "admin") {
        navigation.replace("adminhome");
      } else {
        navigation.replace("Login");
      }

    } catch (error: any) {
      console.error("❌ Signup error:", error);
      
      if (error.response) {
        // Server responded with an error (e.g., 400 User already exists)
        Alert.alert("Signup Failed", error.response.data.message || "Invalid data");
      } else if (error.request) {
        // Network/IP issue
        Alert.alert(
          "Network Error", 
          `Cannot connect to ${BASE_URL}. \n1. Check if Backend is running. \n2. Check if IP is correct in .env.`
        );
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Select background image based on role
  const backgroundImage = () => {
    // Note: Ensure these images exist in your assets folder
    if (role === "passenger") return require("../assets/passenger-bg.jpg");
    if (role === "driver") return require("../assets/driver-bg.jpg");
    return require("../assets/default-bg.jpg");
  };

  return (
    <ImageBackground source={backgroundImage()} style={styles.bg} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Signup as {role}</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Extra inputs only for drivers */}
        {role === "driver" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Bus Number (e.g. WP NB-1234)"
              value={busNumber}
              onChangeText={setBusNumber}
            />

            <TextInput
              style={styles.input}
              placeholder="Bus Route (e.g. 138 Kottawa)"
              value={busRoute}
              onChangeText={setBusRoute}
            />
          </>
        )}

        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Signup</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </Pressable>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)", // Darkened for better text visibility
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
    textAlign: 'center'
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    color: "white",
    marginTop: 20,
    textDecorationLine: "underline",
    fontSize: 14
  },
});
