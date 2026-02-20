import React from "react";
import { View, Text, StyleSheet,Pressable } from "react-native";

export default function RouteScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Route</Text>
      <View>
  <Text>My Route</Text>
  <Text>Route: Colombo → Negombo</Text>
  <Text>Stops:</Text>
  <Text>• Colombo Fort</Text>
  <Text>• Peliyagoda</Text>
  <Text>• Wattala</Text>
  <Text>• Kandana</Text>
  <Text>• Ja-Ela</Text>
  <Text>• Negombo</Text>
  <Pressable style={styles.backButton} onPress={() => navigation.navigate("DriverHome")}>
      <Text style={styles.backButtonText}>Back</Text>
  </Pressable>
</View>

    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

  backButton: {
    padding: 15,
    backgroundColor: "#6A0DAD",
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
