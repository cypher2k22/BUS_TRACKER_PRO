import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Home({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#bbb1c6ff", "#9634d2ff"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Driver Dashboard</Text>
        

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("SearchRoute")}
        >
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("LiveTracking")}
        >
          <Text style={styles.buttonText}>End</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("MyRoute")}
        >
          <Text style={styles.buttonText}>My Route</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("TodaySchedule")}
        >
          <Text style={styles.buttonText}>Today Schedule</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("PassengerInfo")}
        >
          <Text style={styles.buttonText}>Passenger Info</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>BACK</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#65218fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subheader: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#4A0DAD",
    alignItems: "center",
    marginVertical: 10,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
