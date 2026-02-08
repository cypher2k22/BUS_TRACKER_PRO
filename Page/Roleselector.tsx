import React from "react";
import { View, Text, Pressable, StyleSheet, ImageBackground } from "react-native";

export default function RoleSelector({ navigation }: any) {
  return (
    <ImageBackground
      source={require("../assets/Rollselect.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Select Your Role</Text>

        <Pressable
          style={styles.roleButton}
          onPress={() => navigation.navigate("Signup", { role: "passenger" })}
        >
          <Text style={styles.roleText}>Passenger</Text>
        </Pressable>

        <Pressable
          style={styles.roleButton}
          onPress={() => navigation.navigate("Signup", { role: "driver" })}
        >
          <Text style={styles.roleText}>Driver</Text>
        </Pressable>

        <Pressable
          style={styles.roleButton}
          onPress={() => navigation.navigate("Signup", { role: "admin" })}
        >
          <Text style={styles.roleText}>Admin</Text>
        </Pressable>
        <Pressable  style={styles.roleButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.roleText}>Back</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)", // transparent overlay
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    color: "white",
  },
  roleButton: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
  },
  roleText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
