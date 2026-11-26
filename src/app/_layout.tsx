import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { GameProvider } from '../context/GameContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'none',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="rules"
            options={{
              presentation: 'modal',
              animation: 'none',
            }}
          />
          <Stack.Screen name="reveal" options={{ gestureEnabled: false }} />
          <Stack.Screen name="play" options={{ gestureEnabled: false }} />
          <Stack.Screen name="vote" />
          <Stack.Screen name="result" options={{ gestureEnabled: false }} />
        </Stack>
      </GameProvider>
    </SafeAreaProvider>
  );
}
