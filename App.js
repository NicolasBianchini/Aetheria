import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import MicTestScreen from './screens/MicTestScreen';
import BreathTestScreen from './screens/BreathTestScreen';
import BoatGame from './components/BoatGame';
import BalloonGame from './components/BalloonGame';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#3498DB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Aetheria - Terapia Respiratória',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="MicTest"
          component={MicTestScreen}
          options={{
            title: '🎤 Teste de Microfone',
            headerBackTitle: 'Voltar'
          }}
        />
        <Stack.Screen
          name="BreathTest"
          component={BreathTestScreen}
          options={{
            title: '🌬️ Detecção de Sopro',
            headerBackTitle: 'Voltar'
          }}
        />
        <Stack.Screen
          name="BoatGame"
          component={BoatGame}
          options={{
            title: '🚤 Jogo do Barquinho',
            headerBackTitle: 'Voltar'
          }}
        />
        <Stack.Screen
          name="BalloonGame"
          component={BalloonGame}
          options={{
            title: '🎈 Jogo do Balão',
            headerBackTitle: 'Voltar'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
