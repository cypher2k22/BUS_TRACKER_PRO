import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./Page/Home";
import Login from "./Page/Login";
import Signup from "./Page/Signup";
import RoleSelector from "./Page/Roleselector";
import PassengerHome from "./Page/Passanger/Home";
import LiveTracking from "./Page/Passanger/LiveTracking";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="RoleSelector" component={RoleSelector} />
        <Stack.Screen name="PassengerHome" component={PassengerHome} />
        <Stack.Screen name="LiveTracking" component={LiveTracking} />
        <Stack.Screen name="RouteInfo" component={require("./Page/Passanger/RouteInfo").default} />
        <Stack.Screen name="Schedule" component={require("./Page/Passanger/Schedule").default} />
        <Stack.Screen name="SearchRoute" component={require("./Page/Passanger/SearchRoute").default} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
