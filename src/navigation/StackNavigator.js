import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/About';
import AccountSettingsScreen from '../screens/AccountSettings';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='AccountSettingsScreen' component={AccountSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name='AboutScreen' component={AboutScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
