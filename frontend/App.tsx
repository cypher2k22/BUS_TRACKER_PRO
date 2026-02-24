import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./Page/Home";
import Login from "./Page/Login";
import Signup from "./Page/Signup";
import RoleSelector from "./Page/Roleselector";
import PassengerHome from "./Page/Passanger/Home";
import Feedback from "./Page/Passanger/Feedback";
import Schedule from "./Page/Passanger/Schedule";
import SearchRoute from "./Page/Passanger/SearchRoute";
import adminHome from "./Page/admin/Home";
import DriverHome from "./Page/driver/Home";
import MyRoute from "./Page/driver/MyRoute";
import PassengerInfo from "./Page/driver/PassengerInfo";
import TodaySchedule from "./Page/driver/TodaySchedule";
import LiveMap from "./Page/Passanger/LiveMap";
import { Toast } from "react-native-toast-message/lib/src/Toast";


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="RoleSelector" component={RoleSelector} />
        <Stack.Screen name="PassengerHome" component={PassengerHome} />
        <Stack.Screen name="Feedback" component={Feedback} />
        <Stack.Screen name="Schedule" component={Schedule} />
        <Stack.Screen name="SearchRoute" component={SearchRoute} />
        <Stack.Screen name="adminhome" component={adminHome} />
        <Stack.Screen name="DriverHome" component={DriverHome} />
        <Stack.Screen name="MyRoute" component={MyRoute} />
        <Stack.Screen name="PassengerInfo" component={PassengerInfo} />
        <Stack.Screen name="TodaySchedule" component={TodaySchedule} />
        <Stack.Screen name="LiveMap" component={LiveMap} />

      </Stack.Navigator>
    </NavigationContainer>
           <Toast /> 
    </>
  );
}
