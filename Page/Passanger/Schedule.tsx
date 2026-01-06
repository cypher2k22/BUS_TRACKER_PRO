import React from "react";  
import { View, Text, Pressable } from "react-native";

export default function Schedule({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
        <Text>Schedule </Text>
        <Pressable onPress={()=>navigation.navigate("Home")}>
            <Text>Back</Text>
        </Pressable>
    </View>
  )
}