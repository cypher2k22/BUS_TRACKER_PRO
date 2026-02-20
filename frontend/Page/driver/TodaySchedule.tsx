import React from "react";
import { View, Text, StyleSheet,Pressable } from "react-native";

export default function ScheduleScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Schedule</Text>
      <View>
  <Text>Today Schedule</Text>

  <Text>6:30 AM - Colombo → Negombo</Text>
  <Text>12:30 PM - Negombo → Colombo</Text>
  <Text>5:30 PM - Colombo → Negombo</Text>
</View>
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
  button: { backgroundColor: '#6A0DAD', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
