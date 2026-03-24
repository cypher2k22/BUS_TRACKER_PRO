import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function PassengerScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passenger Info</Text>
      <Text style={styles.infoText}>Passenger bookings are not yet supported.</Text>
      <Text style={styles.infoText}>This feature is coming soon.</Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("DriverHome")}
      >
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  infoText: { fontSize: 16, textAlign: "center", marginBottom: 10, color: "#333" },
  backButton: {
    padding: 15,
    backgroundColor: "#6A0DAD",
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    padding: 15,
    backgroundColor: "#6A0DAD",
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
});
