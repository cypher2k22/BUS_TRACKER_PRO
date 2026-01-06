import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Login({ navigation }: any) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Animation for eye tap
  const scale = new Animated.Value(1);
  const onEyePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setShowPassword(!showPassword);
  };

  return (
    <LinearGradient
      colors={["#9c98a1ff", "#bf35f1ff"]}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.header}>Welcome Back!</Text>
        <Text style={styles.subheader}>Login to access your account</Text>

        <TextInput placeholder="Username" style={styles.input} />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1 }]}
          />
          <Pressable onPress={onEyePress} style={styles.eyeButton}>
            <Animated.View style={{ transform: [{ scale }] }}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={28}
                color="#6A0DAD"
              />
            </Animated.View>
          </Pressable>
        </View>

        <Pressable style={styles.loginBtn} onPress={() =>navigation.navigate("PassengerHome")}>
          <Text style={styles.loginBtnText}>LOGIN</Text>
        </Pressable>

        <Text style={styles.signupText}>
          Don't have an account? 
          <Pressable onPress={() => navigation.navigate("Signup")}><Text style={[styles.signupLink, { color: "#6A0DAD" }]}>Sign Up</Text></Pressable>
        </Text>
        <Pressable onPress={() => alert("Forgot Password pressed")}>
          <Text style={{textAlign: "center", color: "#6A0DAD", marginTop: 15}}>Forgot Password?</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Home")}>
          <Text style={{textAlign: "center", color: "#6A0DAD", marginTop: 15}}>← Back</Text>
        </Pressable>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
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
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6A0DAD",
    marginBottom: 5,
  },
  subheader: {
    fontSize: 16,
    color: "#6A0DAD",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
    marginBottom: 20,
    overflow: "hidden",
  },
  eyeButton: {
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBtn: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  loginBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  signupText: {
    textAlign: "center",
    color: "#6A0DAD",
    fontSize: 14,
  },
  signupLink: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
