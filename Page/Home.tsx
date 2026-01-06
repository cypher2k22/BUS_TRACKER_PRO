import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";

export default function Home({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={styles.title}>BUS TRACKER PRO</Text>
        <Text style={styles.subtitle}>
          Track buses. Save time. Travel smart.
        </Text>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.btnText}>LOGIN</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.secondaryText}>CREATE ACCOUNT</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#4B0082",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 2,
    borderColor: "#6A0DAD",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  secondaryText: {
    color: "#6A0DAD",
    fontWeight: "bold",
    fontSize: 16,
  },
});
