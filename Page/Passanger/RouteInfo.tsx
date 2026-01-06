import React from 'react';
import { View, Text, Pressable } from "react-native";

export default function RouteInfo({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
        <Text>Route Info Page</Text>
        <Pressable onPress={()=>navigation.navigate("Home")}>
                    <Text>Back</Text>
        </Pressable>
    </View>
    
  )
}