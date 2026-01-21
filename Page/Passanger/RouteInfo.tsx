import React from 'react';
import { View, Text, Pressable } from "react-native";

export default function RouteInfo({ navigation }: any) {
  return (
    <View style={{ flex: 1 }}>
        <Text>Route Info Page</Text>
        <Pressable onPress={()=>navigation.navigate("PassengerHome")}
                  style={{ padding: 15, backgroundColor: "#6A0DAD", borderRadius: 5 , marginTop: 750, alignItems: 'center', marginHorizontal: 100}}>
        
                            <Text style={{color: 'white',fontSize: 18,fontWeight: "bold",}}>Back</Text>
                </Pressable>
    </View>
    
  )
}