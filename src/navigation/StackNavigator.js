import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/settingScreens/About';
import ChangeEmail from '../screens/settingScreens/ChangeEmail';
import ChangePassword from '../screens/settingScreens/ChangePassword';
import AccountSettingsScreen from '../screens/AccountSettings';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='AccountSettingsScreen' component={AccountSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name='AboutScreen' component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name='ChangeEmail' component={ChangeEmail} options={{ headerShown: false }} />
      <Stack.Screen name='ChangePassword' component={ChangePassword} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
