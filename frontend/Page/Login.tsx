import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import Toast from "react-native-toast-message";

import { auth } from "../firebaseConfig";

// This pulls the IP from your frontend/.env file
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter email and password" });
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      console.log("Firebase Auth Success, fetching profile from:", `${BASE_URL}/api/auth/getprofile`);

      // 2️⃣ Send token to backend (Using Dynamic BASE_URL)
      const response = await axios.get(
        `${BASE_URL}/api/auth/getprofile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const user = response.data.user;

      // 3️⃣ Role-based navigation
      if (user.role === "passenger") {
        navigation.navigate("PassengerHome");
      } else if (user.role === "driver") {
        navigation.navigate("DriverHome");
      } else if (user.role === "admin") {
        navigation.navigate("adminhome");
      } else {
        Toast.show({ type: "error", text1: "Role Error", text2: `User role '${user.role}' not recognized.` });
      }

    } catch (error: any) {
      console.error("Login detail error:", error);

      // Detailed Error Handling
      if (error.code?.startsWith("auth/")) {
        // Firebase specific errors E.g. auth/network-request-failed (Verify .env IP or simulator net connection)
        Toast.show({ type: "error", text1: "Login Failed", text2: error.message });
      } else if (error.code === "ECONNABORTED") {
        Toast.show({ type: "error", text1: "Timeout", text2: "The server took too long to respond." });
      } else if (error.response) {
        // Backend responded with 4xx or 5xx
        Toast.show({ type: "error", text1: "Backend Error", text2: error.response.data.message || "Server rejected the token." });
      } else if (error.request) {
        // Request made but no response (Network/IP issue)
        Toast.show({
          type: "error",
          text1: "Connection Error",
          text2: `Cannot connect to ${BASE_URL}. Check if IP is correct in .env.`
        });
      } else {
        Toast.show({ type: "error", text1: "Error", text2: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#9c98a1ff", "#bf35f1ff"]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Welcome Back!</Text>
        <Text style={styles.subheader}>Login to access your account</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1 }]}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#6A0DAD"
            />
          </Pressable>
        </View>

        <Pressable
          style={[styles.loginBtn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginBtnText}>LOGIN</Text>
          )}
        </Pressable>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate("RoleSelector")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate("adminhome")}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.forgot}>← Back</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: { fontSize: 32, fontWeight: "bold", color: "#6A0DAD", marginBottom: 5 },
  subheader: { fontSize: 16, color: "#6A0DAD", marginBottom: 25 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  passwordContainer: { flexDirection: "row", alignItems: "center" },
  eyeButton: { position: 'absolute', right: 10 },
  loginBtn: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 10,
  },
  loginBtnText: { color: "white", fontWeight: "bold", fontSize: 18 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  signupText: { color: "#6A0DAD", fontSize: 14 },
  signupLink: { color: "#6A0DAD", fontWeight: "bold", textDecorationLine: "underline" },
  forgot: { textAlign: "center", color: "#6A0DAD", marginTop: 15 },
});
