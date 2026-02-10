import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';
import { auth } from '../../firebaseConfig';

export default function SearchRoutes({ navigation }: any) {
  const [allBuses, setAllBuses] = useState<any[]>([]); // Full list from DB
  const [filteredBuses, setFilteredBuses] = useState<any[]>([]); // List shown in UI
  const [loading, setLoading] = useState(true);
  const [startLoc, setStartLoc] = useState('');
  const [dest, setDest] = useState('');

  // 1. Fetch ALL buses on component mount
  useEffect(() => {
    fetchAllBuses();
  }, []);

  // 2. Filter the list whenever startLoc or dest changes
  useEffect(() => {
    const filtered = allBuses.filter(bus => {
      const matchStart = bus.startinglocation.toLowerCase().includes(startLoc.toLowerCase());
      const matchDest = bus.destination.toLowerCase().includes(dest.toLowerCase());
      return matchStart && matchDest;
    });
    setFilteredBuses(filtered);
  }, [startLoc, dest, allBuses]);

  const fetchAllBuses = async () => {
  setLoading(true);
  try {
    const token = await auth.currentUser?.getIdToken();
    
    // Using your verified hostname with the correct passenger prefix
    const response = await axios.get(
      `http://bakeerathans-macbook-air.local:3000/api/passenger/search-buses`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("✅ Connection Successful!");
    setAllBuses(response.data.buses || []);
    setFilteredBuses(response.data.buses || []);
  } catch (error: any) {
    if (error.response) {
      console.error(`❌ Server responded with ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else {
      console.error("❌ Network Error: Check if server is running");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Your Route</Text>

      <View style={styles.searchBox}>
        <TextInput 
          placeholder="Type Starting Location..." 
          value={startLoc} 
          onChangeText={setStartLoc} 
          style={styles.input} 
        />
        <TextInput 
          placeholder="Type Destination..." 
          value={dest} 
          onChangeText={setDest} 
          style={styles.input} 
        />
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("PassengerHome")}
        >
          <Text style={styles.buttonText}>Back</Text>
        </Pressable> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6A0DAD" />
      ) : (
        <FlatList
          data={filteredBuses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable 
              style={styles.routeCard} 
              onPress={() => navigation.navigate('BusDetails', { bus: item })}
            >
              <Text style={styles.busName}>{item.busName}</Text>
              <Text style={styles.routeText}>From: {item.startinglocation} To: {item.destination}</Text>
              <Text style={styles.timeText}>🕒 {item.starttime} - {item.endtime}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No matches found.</Text>}
        />
         
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#6A0DAD' ,marginTop: 30 },
  searchBox: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: '#F9F9F9' },
  routeCard: { padding: 15, marginBottom: 10, backgroundColor: '#fff', borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, borderLeftWidth: 5, borderLeftColor: '#6A0DAD' },
  busName: { fontWeight: 'bold', fontSize: 18, color: '#333' },
  routeText: { fontSize: 14, color: '#666', marginVertical: 4 },
  timeText: { fontSize: 14, color: '#6A0DAD' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  button: { backgroundColor: '#6A0DAD', paddingVertical: 12, borderRadius: 25, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
