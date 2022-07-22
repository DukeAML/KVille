import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import CountDown from 'react-native-countdown-component';
import * as SplashScreen from 'expo-splash-screen'; 

export default function Monitor() {
  const [isReady, setIsReady] = useState(false);
  const [time, setTime] = useState();

  useEffect(() => {
    let mounted = true;
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        setTime(
          Math.round((new Date(2023, 1, 5).getTime() - Date.now()) / 1000)
        );
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }
    if (mounted) {
      prepare();
    }
    return () => (mounted = false);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View
      style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
      onLayout={onLayoutRootView}
    >
      <CountDown
        size={30}
        until={time}
        onFinish={() => alert('Finished')}
        digitStyle={{
          backgroundColor: '#FFF',
          borderWidth: 2,
          borderColor: '#1CC625',
        }}
        digitTxtStyle={{ color: '#1CC625' }}
        timeLabelStyle={{ color: 'black', fontWeight: 'bold' }}
        separatorStyle={{ color: '#1CC625' }}
        showSeparator
      />
    </View>
  );
}
