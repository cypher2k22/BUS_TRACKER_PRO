import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Signup({ navigation }: any) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <LinearGradient
      colors={["#bbb1c6ff", "#9634d2ff"]}
      style={styles.container}
    >
      <Text style={styles.hed}>BUS TRACKER PRO</Text>
      <Text style={styles.subhed}>Sign up to get started</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.labelText}>Full Name</Text>
        <TextInput placeholder="Enter your full name" style={styles.input} />

        <Text style={styles.labelText}>Email</Text>
        <TextInput placeholder="Enter your email" style={styles.input} />

        <Text style={styles.labelText}>Username</Text>
        <TextInput placeholder="Enter your username" style={styles.input} />

        <Text style={styles.labelText}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={!passwordVisible}
          />
          <Pressable onPress={() => setPasswordVisible(!passwordVisible)}>
            <MaterialCommunityIcons
              name={passwordVisible ? "eye-off" : "eye"}
              size={28}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
        onPress={() => alert("Sign Up pressed")}
      >
        <LinearGradient
          colors={["#202152ff", "#1754cdff"]}
          style={styles.gradientButton}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.backButton,
          pressed && styles.pressed,
        ]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>BACK</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  hed: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subhed: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  button: {
    borderRadius: 12,
    marginBottom: 15,
  },
  gradientButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  pressed: {
    opacity: 0.8,
  },
});
