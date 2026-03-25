import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import your existing pages
import Home from "./Page/Home";
import Login from "./Page/Login";
import Signup from "./Page/Signup";
import RoleSelector from "./Page/Roleselector";
import PassengerHome from "./Page/Passanger/Home";
import Feedback from "./Page/Passanger/Feedback";
import Schedule from "./Page/Passanger/Schedule";
import SearchRoute from "./Page/Passanger/SearchRoute";
import PassengerSearch from "./Page/Passanger/PassengerSearch";
import RouteMap from "./Page/Passanger/RouteMap";
import adminHome from "./Page/admin/Home";
import DriverHome from "./Page/driver/Home";
import MyRoute from "./Page/driver/MyRoute";
import PassengerInfo from "./Page/driver/PassengerInfo";
import TodaySchedule from "./Page/driver/TodaySchedule";
import LiveMap from "./Page/Passanger/LiveMap";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Buses from "./Page/admin/Buses";
import LiveTracking from "./Page/admin/LiveTracking";
import AdminRoutes from "./Page/admin/AdminRoutes";
import AdminDrivers from "./Page/admin/AdminDrivers";
import AdminPassengers from "./Page/admin/AdminPassengers";
import AdminFeedback from "./Page/admin/AdminFeedback";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Main Auth & Entry */}
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="RoleSelector" component={RoleSelector} />

          {/* Passenger Side */}
          <Stack.Screen name="PassengerHome" component={PassengerHome} />
          <Stack.Screen name="Feedback" component={Feedback} />
          <Stack.Screen name="Schedule" component={Schedule} />
          <Stack.Screen name="SearchRoute" component={SearchRoute} />
          <Stack.Screen name="PassengerSearch" component={PassengerSearch} />
          <Stack.Screen name="RouteMap" component={RouteMap} />
          <Stack.Screen name="LiveMap" component={LiveMap} />

          {/* Driver Side */}
          <Stack.Screen name="DriverHome" component={DriverHome} />
          <Stack.Screen name="MyRoute" component={MyRoute} />
          <Stack.Screen name="PassengerInfo" component={PassengerInfo} />
          <Stack.Screen name="TodaySchedule" component={TodaySchedule} />

          {/* Admin Side - Standard Names */}
          <Stack.Screen name="adminhome" component={adminHome} />
          <Stack.Screen name="LiveTracking" component={LiveTracking} />
          <Stack.Screen name="Buses" component={Buses} />

          {/* FIX: Aliases for the 'NAVIGATE' errors you received */}
          {/* These match the exact strings the new Git code is calling */}
          <Stack.Screen name="AdminBuses" component={Buses} />
          <Stack.Screen name="AdminLiveTracking" component={LiveTracking} />
          <Stack.Screen name="AdminRoutes" component={AdminRoutes} />
          <Stack.Screen name="AdminDrivers" component={AdminDrivers} />
          <Stack.Screen name="AdminPassengers" component={AdminPassengers} />
          <Stack.Screen name="AdminFeedback" component={AdminFeedback} />
          <Stack.Screen name="AdminHome" component={adminHome} />

        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
