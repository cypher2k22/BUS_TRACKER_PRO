import React, { useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { auth } from "../../firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000");

export default function Feedback({ navigation }: any) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!feedback || rating === 0) {
      Alert.alert("Oops!", "Please provide both a rating and your comments. 😊");
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(`${BASE_URL}/api/passenger/feedback`, {
        feedback,
        rating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Success", "Thank you for your valuable feedback! ❤️");
      setFeedback("");
      setRating(0);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong while sending your feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Share Feedback</Text>
          <Text style={styles.subheader}>
            Your experience helps us drive better.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>How was your ride?</Text>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Pressable
                key={num}
                onPress={() => setRating(num)}
                style={styles.starWrapper}
              >
                <MaterialCommunityIcons 
                  name={rating >= num ? "star" : "star-outline"} 
                  size={36} 
                  color={rating >= num ? "#FFD700" : "#ccc"} 
                />
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Tell us what you loved or what we can improve..."
            placeholderTextColor="#999"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={5}
            style={styles.input}
          />

          <Pressable 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={submitFeedback}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator color="white" />
                <Text style={styles.loadingText}>Sending...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Submit Feedback</Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  header: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  subheader: {
    fontSize: 16,
    color: "#d1d1d1",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 30,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#192f6a",
    marginBottom: 20,
    textAlign: "center",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  starWrapper: {
    padding: 2,
  },
  input: {
    height: 140,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    padding: 20,
    textAlignVertical: "top",
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#192f6a",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#192f6a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#5c74b0",
    elevation: 0,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  loadingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 18,
  },
  backButton: {
    marginTop: 16,
    alignItems: "center",
  },
  backText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
});
