import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FlashMessage from "react-native-flash-message";
import { Ionicons } from '@expo/vector-icons';
import { Varvaa } from './Varvaa';
import { Retkikunta } from './Retkikunta';
import { Kamera } from './Kamera';
import { Saa } from './Saa';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function VarvaaStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="Tietojen syöttö" component={Varvaa} />
      <Stack.Screen name="Kamera" component={Kamera} />
    </Stack.Navigator>
  );
}

const screenOptions = ({ route }) => ({
  tabBarIcon: ({ color, size }) => {
    let iconName;

    if (route.name === 'Värvää') {
      iconName = 'person-add';
    } else if (route.name === 'Retkikunta') {
      iconName = 'people';
    } else if (route.name === 'Sää') {
      iconName = 'sunny';
    }

    return <Ionicons name={iconName} size={size} color={color} />;
  }
});

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="Värvää" component={VarvaaStack} />
        <Tab.Screen name="Retkikunta" component={Retkikunta} />
        <Tab.Screen name="Sää" component={Saa} />
      </Tab.Navigator>
      <FlashMessage position="center" />
    </NavigationContainer>
  );
}