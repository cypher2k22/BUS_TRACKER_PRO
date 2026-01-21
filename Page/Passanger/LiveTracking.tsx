import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { mockBusLocations } from "../../mockData";

export default function LiveTracking() {
  // Initialize all buses safely
  const [buses, setBuses] = useState(
    mockBusLocations.map(bus => ({ ...bus }))
  );

  // Dummy path for simulation
  const dummyPath = [
    { lat: 6.9271, lng: 79.8612 },
    { lat: 6.9276, lng: 79.8620 },
    { lat: 6.9282, lng: 79.8630 },
    { lat: 6.9288, lng: 79.8640 },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % dummyPath.length;

      setBuses(prevBuses =>
        prevBuses.map(bus => {
          const next = dummyPath[index];
          return { ...bus, lat: next.lat, lng: next.lng };
        })
      );
    }, 2000); // move every 2 seconds

    return () => clearInterval(interval);
  }, []);

  if (!buses || buses.length === 0) {
    return (
      <View style={styles.loading}>
        <Text>Loading bus locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: buses[0].lat,
          longitude: buses[0].lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {buses.map(bus =>
          bus.lat && bus.lng ? (
            <Marker
              key={bus.busNumber}
              coordinate={{ latitude: bus.lat, longitude: bus.lng }}
              title={`Bus ${bus.busNumber}`}
              description={`Route ID: ${bus.routeId}`}
            />
          ) : null
        )}
      </MapView>

      <ScrollView style={styles.infoContainer}>
        {buses.map(bus => (
          <View key={bus.busNumber} style={styles.info}>
            <Text style={styles.text}>🚌 Bus: {bus.busNumber}</Text>
            <Text style={styles.text}>
              📍 Lat: {bus.lat?.toFixed(4) ?? "N/A"}, Lng:{" "}
              {bus.lng?.toFixed(4) ?? "N/A"}
            </Text>
            <Text style={styles.text}>Route ID: {bus.routeId}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    maxHeight: 200,
  },
  info: {
    backgroundColor: "white",
    padding: 10,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 5,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
