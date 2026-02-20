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
        <Text style={styles.header}>Welcome to App Tracker Pro</Text>
        <Text style={styles.subheader}>
          
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("SearchRoute")}
        >
          <Text style={styles.buttonText}>create route</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("LiveTracking")}
        >
          <Text style={styles.buttonText}>Delete Route</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Schedule")}
        >
          <Text style={styles.buttonText}>Edit Route</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("RouteInfo")}
        >
          <Text style={styles.buttonText}>Add bus</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>delete bus</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>edit bus</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Back</Text>
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
    fontSize: 36,
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
