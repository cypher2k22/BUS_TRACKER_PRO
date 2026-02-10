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
} from "react-native";
import axios from "axios";

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
      const SIGNUP_URL = "http://bakeerathans-macbook-air.local:3000/api/auth/signup";
      
      const response = await axios.post(SIGNUP_URL, payload);

      // --- NEW NAVIGATION LOGIC ---
      Alert.alert("Success", "Account created successfully!");

      // Navigate based on the 'role' variable already in your state
      if (role === "passenger") {
        navigation.replace("PassengerHome"); 
      } else if (role === "driver") {
        navigation.replace("DriverHome");
      } else if (role === "admin") {
        navigation.replace("adminhome");
      } else {
        // Fallback if role is undefined
        navigation.replace("Login");
      }
      // -----------------------------

    } catch (error: any) {
      console.error("❌ Signup error:", error);
      if (error.response) {
        Alert.alert("Signup Failed", error.response.data.message || "Invalid data");
      } else {
        Alert.alert("Network Error", "Cannot connect to backend server.");
      }
    } finally {
      setLoading(false);
    }
  };


  // Select background image based on role
  const backgroundImage = () => {
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
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
              placeholder="Bus Number"
              value={busNumber}
              onChangeText={setBusNumber}
            />

            <TextInput
              style={styles.input}
              placeholder="Bus Route"
              value={busRoute}
              onChangeText={setBusRoute}
            />
          </>
        )}

        <Pressable
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing up..." : "Signup"}
          </Text>
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
  },

  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  linkText: {
    color: "white",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
