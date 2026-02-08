import React, { useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  ImageBackground 
} from "react-native";
import { mockSchedules, mockRoutes } from "../../mockData";

export default function Schedule({ navigation }: any) {

  // Merge schedule with route info
  const schedulesWithRoute = mockSchedules.map(schedule => {
    const route = mockRoutes.find(r => r.id === schedule.routeId);
    return { ...schedule, start: route?.start, destination: route?.destination };
  });

  // State for filters
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [filteredSchedules, setFilteredSchedules] = useState(schedulesWithRoute);

  // Filter function
  const filterSchedules = () => {
    const filtered = schedulesWithRoute.filter(s => {
      return (
        (!startLocation || s.start.toLowerCase().includes(startLocation.toLowerCase())) &&
        (!destination || s.destination.toLowerCase().includes(destination.toLowerCase())) &&
        (!departureTime || s.departure.includes(departureTime))
      );
    });
    setFilteredSchedules(filtered);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/home.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <Text style={styles.header}>Bus Schedules</Text>

        {/* Search Inputs */}
        <TextInput
          placeholder="Starting location"
          style={styles.input}
          value={startLocation}
          onChangeText={setStartLocation}
        />
        <TextInput
          placeholder="Destination"
          style={styles.input}
          value={destination}
          onChangeText={setDestination}
        />
        <TextInput
          placeholder="Departure time"
          style={styles.input}
          value={departureTime}
          onChangeText={setDepartureTime}
        />

        {/* Search Button */}
        <Pressable style={styles.searchButton} onPress={filterSchedules}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>

        {/* Bus Results */}
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item) => item.busNumber}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.busNumber}>{item.busNumber}</Text>
              <Text>{item.start} → {item.destination}</Text>
              <Text>Departure: {item.departure}</Text>
              <Text>Arrival: {item.arrival}</Text>
            </View>
          )}
        />

        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, padding: 16,  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 16, 
    textAlign: "center", 
    color: "#b900c6" ,
    marginTop: 40

  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  searchButton: {
    backgroundColor: "#6A0DAD",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  busNumber: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
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
