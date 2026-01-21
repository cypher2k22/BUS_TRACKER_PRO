import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { mockRoutes } from "../../mockData"; // adjust path

export default function SearchRoutes({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search Routes</Text>

      <FlatList 
        data={mockRoutes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.routeCard}
            onPress={() => navigation.navigate("RouteInfo", { routeId: item.id })}
          >
            <Text style={styles.routeText}>
              {item.start} → {item.destination}
            </Text>
            <Text>Fare: LKR {item.fare}</Text>
          </Pressable>
          
          
        )}
      />
     <Pressable onPress={()=>navigation.navigate("PassengerHome")}
               style={{ padding: 15, backgroundColor: "#6A0DAD", borderRadius: 5 , alignItems: 'center', marginHorizontal: 100}}>
     
                         <Text style={{color: 'white',fontSize: 18,fontWeight: "bold",}}>Back</Text>
             </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  routeCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  routeText: { fontWeight: "bold", fontSize: 18 },
});
