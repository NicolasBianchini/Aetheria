import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import BoatGameScreen from './screens/BoatGameScreen';
import BalloonGame from './components/BalloonGame';
import PatientsScreen from './screens/PatientsScreen';
import PatientDetailScreen from './screens/PatientDetailScreen';
import PatientReportScreen from './screens/PatientReportScreen';
import SelectPatientScreen from './screens/SelectPatientScreen';

const Stack = createStackNavigator();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="SelectPatient" component={SelectPatientScreen} />
            <Stack.Screen name="BoatGame" component={BoatGameScreen} />
            <Stack.Screen name="BalloonGame" component={BalloonGame} />
            <Stack.Screen name="Patients" component={PatientsScreen} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
            <Stack.Screen name="PatientReport" component={PatientReportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  text: {
    fontSize: 18,
    color: '#1E293B',
  },
});
