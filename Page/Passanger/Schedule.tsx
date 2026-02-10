import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView ,TextInput} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Home({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#bbb1c6ff", "#9634d2ff"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>SCHEDULE YOUR BUS</Text>
      
        <TextInput
          placeholder="STARTING POINT"
          placeholderTextColor="#999"
          style={styles.textinput}
        />
        <TextInput
          placeholder="DESTINATION"
          placeholderTextColor="#999"
          style={styles.textinput}
        />
        <TextInput
          placeholder="STARTING TIME"
          placeholderTextColor="#999"
          style={styles.textinput}
        />

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("PassengerHome")}
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
  textinput: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
});
