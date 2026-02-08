import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ImageBackground } from "react-native";

export default function Signup({ route, navigation }: any) {
  const { role } = route.params; // passenger | driver | admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [busRoute, setBusRoute] = useState("");

  const handleSignup = () => {
    const payload: any = { name, email, password, role };
    if (role === "driver") {
      payload.busNumber = busNumber;
      payload.busRoute = busRoute;
    }
    console.log("Signup data:", payload);
    // call your backend API here
  };

  // Select background image based on role
  const backgroundImage = () => {
    if (role === "passenger") return require("../assets/passenger-bg.jpg");
    if (role === "driver") return require("../assets/driver-bg.jpg");
    if (role === "admin") return require("../assets/admin-bg.jpg");
    return require("../assets/default-bg.jpg"); // fallback
  };

  return (
    <ImageBackground source={backgroundImage()} style={styles.bg} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Signup as {role}</Text>

        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {role === "driver" && (
          <>
            <TextInput style={styles.input} placeholder="Bus Number" value={busNumber} onChangeText={setBusNumber} />
            <TextInput style={styles.input} placeholder="Bus Route" value={busRoute} onChangeText={setBusRoute} />
          </>
        )}

        <Pressable style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Signup</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("RoleSelector")}>
          <Text style={{ color: "white", marginTop: 15 }}>Back</Text>
        </Pressable>  
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: "white", marginTop: 15 }}>Already have an account? Login</Text>
        </Pressable>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.35)" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30, color: "white" },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: "white" },
  button: { backgroundColor: "#6A0DAD", paddingVertical: 15, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
