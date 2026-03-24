import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { auth } from "../../firebaseConfig";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function Feedback({ navigation }: any) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const submitFeedback = async () => {
    if (!feedback || rating === 0) {
      Alert.alert("Error", "Please give rating and feedback 😊");
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`${BASE_URL}/api/passenger/feedback`, {
        feedback,
        rating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Thank You!", "Your feedback was submitted successfully ❤️");
      setFeedback("");
      setRating(0);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#bbb1c6ff", "#9634d2ff"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Feedback</Text>
        <Text style={styles.subheader}>
          Help us improve by sharing your experience ⭐
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Rate Your Experience</Text>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Pressable
                key={num}
                onPress={() => setRating(num)}
                style={[
                  styles.starBtn,
                  rating >= num && styles.starActive,
                ]}
              >
                <Text style={styles.starText}>★</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Write your feedback here..."
            placeholderTextColor="#999"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            style={styles.input}
          />

          <Pressable style={styles.button} onPress={submitFeedback}>
            <Text style={styles.buttonText}>Submit Feedback</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Go Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  header: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },

  subheader: {
    fontSize: 16,
    color: "#f1f1f1",
    textAlign: "center",
    marginBottom: 30,
  },

  card: {
    width: "100%",
    backgroundColor: "#ffffffee",
    borderRadius: 20,
    padding: 20,
    elevation: 6,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6A0DAD",
    marginBottom: 10,
  },

  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },

  starBtn: {
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },

  starActive: {
    backgroundColor: "#FFD700",
  },

  starText: {
    fontSize: 26,
  },

  input: {
    height: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 15,
    textAlignVertical: "top",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 10,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

  backText: {
    textAlign: "center",
    color: "#6A0DAD",
    fontWeight: "bold",
    marginTop: 10,
  },
});
