import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/settings/About';
import ChangeEmail from '../screens/settings/ChangeEmail';
import ChangePassword from '../screens/settings/ChangePassword';
import AccountSettingsScreen from '../screens/settings/AccountSettings';
import DeleteAccount from '../screens/settings/DeleteAccount';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='AccountSettingsScreen' component={AccountSettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name='AboutScreen' component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name='ChangeEmail' component={ChangeEmail} options={{ headerShown: false }} />
      <Stack.Screen name='ChangePassword' component={ChangePassword} options={{ headerShown: false }} />
      <Stack.Screen name='DeleteAccount' component={DeleteAccount} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
