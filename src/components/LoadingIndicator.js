import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../context/ThemeProvider';

export function LoadingIndicator() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
      }}
    >
      <ActivityIndicator size='large' />
    </View>
  );
}
