import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  FlatList
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

export default function RouteMap({ route, navigation }: any) {
  const { routeData } = route.params;
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn("Location permission denied");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      setLoading(false);
    })();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getETA = (distanceKm: number) => {
    const avgSpeedKmh = 30; // 30 km/h average bus speed
    const timeHours = distanceKm / avgSpeedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    return timeMinutes;
  };

  const renderStopItem = ({ item }: any) => {
    const dist = userLocation 
      ? calculateDistance(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude)
      : null;
    const eta = dist ? getETA(dist) : null;

    return (
      <View style={styles.stopCard}>
        <MaterialCommunityIcons name="bus-stop" size={24} color="#6A0DAD" />
        <View style={styles.stopInfo}>
          <Text style={styles.stopName}>{item.name}</Text>
          <Text style={styles.stopDist}>
            {dist ? `${dist.toFixed(1)} km away` : "Calculating distance..."}
          </Text>
        </View>
        <View style={styles.etaContainer}>
          <Text style={styles.etaLabel}>ETA</Text>
          <Text style={styles.etaValue}>{eta ? `${eta}m` : "--"}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: routeData.startLocation.latitude,
          longitude: routeData.startLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* User Location */}
        {userLocation && (
          <Marker 
            coordinate={userLocation}
            title="My Location"
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Start & End Markers */}
        <Marker 
          coordinate={routeData.startLocation}
          title="Start"
          pinColor="blue"
        />
        <Marker 
          coordinate={routeData.endLocation}
          title="Destination"
          pinColor="red"
        />

        {/* Bus Stops */}
        {routeData.stops.map((stop: any) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
          >
             <MaterialCommunityIcons name="bus-stop-uncovered" size={24} color="#6A0DAD" />
          </Marker>
        ))}

        {/* Route Polyline */}
        <Polyline
          coordinates={routeData.coordinates}
          strokeColor="#6A0DAD"
          strokeWidth={4}
        />
      </MapView>

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#333" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.routeLabel} numberOfLines={1}>
            {routeData.startLocation.title} → {routeData.endLocation.title}
          </Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.bottomHeader}>
          <Text style={styles.bottomTitle}>Nearby Bus Stands</Text>
          <Text style={styles.stopCount}>{routeData.stops.length} Found</Text>
        </View>
        
        <FlatList
          data={routeData.stops}
          renderItem={renderStopItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stopsList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  routeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  bottomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 15,
    alignItems: 'center',
  },
  bottomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stopCount: {
    fontSize: 14,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
  stopsList: {
    paddingHorizontal: 20,
  },
  stopCard: {
    backgroundColor: '#F8F9FA',
    width: 200,
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  stopInfo: {
    flex: 1,
    marginLeft: 10,
  },
  stopName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  stopDist: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  etaContainer: {
    alignItems: 'center',
    backgroundColor: '#6A0DAD',
    padding: 8,
    borderRadius: 12,
  },
  etaLabel: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
  },
  etaValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  }
});
