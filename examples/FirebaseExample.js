// Exemplo prático de uso do Firebase Authentication e Firestore
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import FirestoreService from '../services/FirestoreService';

export default function FirebaseExample() {
  const { user, login, register, logout, loading } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const userStats = await FirestoreService.getUserStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogin = async () => {
    const result = await login('teste@exemplo.com', '123456');
    if (result.success) {
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } else {
      Alert.alert('Erro', result.message);
    }
  };

  const handleRegister = async () => {
    const result = await register('novo@exemplo.com', '123456', { 
      name: 'Usuário Teste' 
    });
    if (result.success) {
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
    } else {
      Alert.alert('Erro', result.message);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      Alert.alert('Sucesso', 'Logout realizado com sucesso!');
      setStats(null);
    }
  };

  const createTestSession = async () => {
    if (!user) return;

    try {
      const session = await FirestoreService.createSession({
        userId: user.uid,
        gameType: 'boat',
        score: 0,
        duration: 0,
        completed: false
      });

      Alert.alert('Sucesso', `Sessão criada: ${session.id}`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar sessão');
    }
  };

  const createTestPatient = async () => {
    if (!user) return;

    try {
      const patient = await FirestoreService.createPatient({
        userId: user.uid,
        name: 'Paciente Teste',
        age: 45,
        diagnosis: 'DPOC',
        notes: 'Paciente para teste'
      });

      Alert.alert('Sucesso', `Paciente criado: ${patient.id}`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar paciente');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Firebase Example
      </Text>

      {!user ? (
        <View>
          <Text style={{ marginBottom: 20 }}>
            Usuário não autenticado
          </Text>
          <Button title="Login (teste@exemplo.com)" onPress={handleLogin} />
          <View style={{ height: 10 }} />
          <Button title="Registrar Novo Usuário" onPress={handleRegister} />
        </View>
      ) : (
        <View>
          <Text style={{ marginBottom: 20 }}>
            Usuário: {user.email}
          </Text>
          
          {stats && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>Estatísticas:</Text>
              <Text>Total de Sessões: {stats.totalSessions}</Text>
              <Text>Tempo Total: {stats.totalTime}s</Text>
              <Text>Pontuação Total: {stats.totalScore}</Text>
              <Text>Streak: {stats.streakDays} dias</Text>
            </View>
          )}

          <Button title="Criar Sessão de Teste" onPress={createTestSession} />
          <View style={{ height: 10 }} />
          <Button title="Criar Paciente de Teste" onPress={createTestPatient} />
          <View style={{ height: 10 }} />
          <Button title="Logout" onPress={handleLogout} />
        </View>
      )}
    </View>
  );
}
