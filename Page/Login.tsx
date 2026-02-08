// Page/Passenger/Login.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { mockUsers } from "../mockData";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      Alert.alert("Error", "Account not found");
      return;
    }

    if (user.password !== password) {
      Alert.alert("Error", "Wrong password");
      return;
    }

    Alert.alert("Success", `Login successful! Role: ${user.role}`);

    // Role-based navigation
    if (user.role === "passenger") {
      navigation.navigate("PassengerHome");
    } else if (user.role === "driver") {
      navigation.navigate("DriverHome");
    } else if (user.role === "admin") {
      navigation.navigate("AdminDashboard");
    }
  };

  return (
    <LinearGradient
      colors={["#9c98a1ff", "#bf35f1ff"]}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.header}>Welcome Back!</Text>
        <Text style={styles.subheader}>Login to access your account</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
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
              size={28}
              color="#6A0DAD"
            />
          </Pressable>
        </View>

        <Pressable style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>LOGIN</Text>
        </Pressable>

        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Pressable onPress={() => navigation.navigate("RoleSelector")}>
            <Text style={[styles.signupLink, { color: "#6A0DAD" }]}>
              Sign Up
            </Text>
          </Pressable>
        </Text>

        <Pressable onPress={() => Alert.alert("Forgot Password pressed")}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Home")}>
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
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
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
  eyeButton: { paddingHorizontal: 10, justifyContent: "center" },
  loginBtn: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 20,
  },
  loginBtnText: { color: "white", fontWeight: "bold", fontSize: 18 },
  signupText: { textAlign: "center", color: "#6A0DAD", fontSize: 14 },
  signupLink: { fontWeight: "bold", textDecorationLine: "underline" },
  forgot: { textAlign: "center", color: "#6A0DAD", marginTop: 15 },
});
