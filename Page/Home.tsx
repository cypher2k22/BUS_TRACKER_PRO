import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ImageBackground,
} from "react-native";

export default function Home({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/home.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>BUS TRACKER PRO</Text>
        <Text style={styles.subtitle}>
          Track buses. Save time. Travel smart.
        </Text>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.btnText}>Login</Text>
        </Pressable>

        <Text style={styles.helperText}>
          Don’t have an account?
        </Text>

        <Pressable onPress={() => navigation.navigate("RoleSelector")}>
          <Text style={styles.linkText}>Create an account</Text>
        </Pressable>
      </Animated.View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  content: {
    zIndex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#EDEDED",
    textAlign: "center",
    marginBottom: 36,
  },
  primaryBtn: {
    backgroundColor: "#6A0DAD",
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 14,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  helperText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  linkText: {
    color: "#4DA3FF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
