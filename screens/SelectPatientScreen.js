import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { ArrowLeft, Users, Search } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import FirestoreService from '../services/FirestoreService';

export default function SelectPatientScreen({ navigation, route }) {
  const { game } = route.params;
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [user]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const patientsData = await FirestoreService.getPatientsByUser(user.id);
        setPatients(patientsData);
        setFilteredPatients(patientsData);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pacientes por texto de busca
  useEffect(() => {
    if (!searchText) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredPatients(filtered);
  }, [searchText, patients]);

  const handleSelectPatient = (patient) => {
    if (game.id === 'barquinho') {
      navigation.navigate('BoatGame', { patient });
    } else if (game.id === 'balao' || game.id === 'balão' || game.title === 'Balão do Palhaço') {
      navigation.navigate('BalloonGame', { patient });
    } else {
      Alert.alert(
        game.title,
        `${game.description}\n\nFuncionalidade em desenvolvimento!`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <ArrowLeft size={20} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Selecionar Paciente</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Game Info */}
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <Text style={styles.gameDescription}>{game.description}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar paciente..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Patients List */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Carregando pacientes...</Text>
          </View>
        ) : filteredPatients.length === 0 ? (
          <View style={styles.centerContainer}>
            <Users size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>
              {searchText ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'Tente buscar com outros termos' : 'Adicione um paciente na área do médico'}
            </Text>
          </View>
        ) : (
          <View style={styles.patientsList}>
            {filteredPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.patientCard}
                onPress={() => handleSelectPatient(patient)}
              >
                <View style={styles.patientAvatar}>
                  <Users size={24} color="#3498DB" />
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientEmail}>{patient.email}</Text>
                  <Text style={styles.patientDetails}>
                    {patient.age} anos • {patient.condition}
                  </Text>
                </View>
                <View style={styles.patientArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  gameInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  patientsList: {
    paddingVertical: 12,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  patientDetails: {
    fontSize: 13,
    color: '#64748B',
  },
  patientArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#3498DB',
  },
});

