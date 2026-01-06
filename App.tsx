import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './Page/Home';
import Login from './Page/Login';
import Start from './Page/Signup';
import Signup from './Page/Signup';
import PassangerHome from './Page/Passanger/Home';
import SearchRoute from './Page/Passanger/SearchRoute';
import LiveTracking from './Page/Passanger/LiveTracking';
import Schedule from './Page/Passanger/Schedule';
import RouteInfo from './Page/Passanger/RouteInfo';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="PassengerHome" component={PassangerHome} />
        <Stack.Screen name="SearchRoute" component={SearchRoute} />
        <Stack.Screen name="LiveTracking" component={LiveTracking} />
        <Stack.Screen name="Schedule" component={Schedule} />
        <Stack.Screen name="RouteInfo" component={RouteInfo} />

       
      </Stack.Navigator>
    </NavigationContainer>
  );
}
