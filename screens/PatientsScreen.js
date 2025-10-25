import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import {
  Users,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Award,
  BarChart3,
  UserPlus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function PatientsScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    age: '',
    condition: '',
    phone: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    condition: 'all',
    performance: 'all',
    lastActivity: 'all',
  });

  // Dados mockados para demonstração
  useEffect(() => {
    const mockPatients = [
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        age: 45,
        condition: 'Asma',
        phone: '(11) 99999-9999',
        lastActivity: '2024-01-20',
        totalSessions: 15,
        avgScore: 85,
        improvement: 12,
        gamesPlayed: {
          balloon: 8,
          boat: 7,
        },
        recentScores: [78, 82, 85, 88, 90],
        status: 'active',
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao.santos@email.com',
        age: 38,
        condition: 'DPOC',
        phone: '(11) 88888-8888',
        lastActivity: '2024-01-19',
        totalSessions: 22,
        avgScore: 72,
        improvement: 8,
        gamesPlayed: {
          balloon: 12,
          boat: 10,
        },
        recentScores: [65, 68, 70, 72, 75],
        status: 'active',
      },
      {
        id: '3',
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        age: 52,
        condition: 'Bronquite',
        phone: '(11) 77777-7777',
        lastActivity: '2024-01-18',
        totalSessions: 8,
        avgScore: 68,
        improvement: 15,
        gamesPlayed: {
          balloon: 5,
          boat: 3,
        },
        recentScores: [55, 60, 65, 68, 70],
        status: 'inactive',
      },
    ];
    setPatients(mockPatients);
    setFilteredPatients(mockPatients);
  }, []);

  // Filtrar pacientes
  useEffect(() => {
    let filtered = patients;

    // Filtro por texto de busca
    if (searchText) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchText.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchText.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtros adicionais
    if (filterOptions.condition !== 'all') {
      filtered = filtered.filter(patient => patient.condition === filterOptions.condition);
    }

    if (filterOptions.performance !== 'all') {
      if (filterOptions.performance === 'high') {
        filtered = filtered.filter(patient => patient.avgScore >= 80);
      } else if (filterOptions.performance === 'medium') {
        filtered = filtered.filter(patient => patient.avgScore >= 60 && patient.avgScore < 80);
      } else if (filterOptions.performance === 'low') {
        filtered = filtered.filter(patient => patient.avgScore < 60);
      }
    }

    if (filterOptions.lastActivity !== 'all') {
      const today = new Date();
      const daysAgo = parseInt(filterOptions.lastActivity);
      const cutoffDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(patient => {
        const lastActivityDate = new Date(patient.lastActivity);
        return lastActivityDate >= cutoffDate;
      });
    }

    setFilteredPatients(filtered);
  }, [patients, searchText, filterOptions]);

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.email || !newPatient.age || !newPatient.condition) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const patient = {
      id: Date.now().toString(),
      ...newPatient,
      age: parseInt(newPatient.age),
      lastActivity: new Date().toISOString().split('T')[0],
      totalSessions: 0,
      avgScore: 0,
      improvement: 0,
      gamesPlayed: {
        balloon: 0,
        boat: 0,
      },
      recentScores: [],
      status: 'active',
    };

    setPatients([...patients, patient]);
    setNewPatient({
      name: '',
      email: '',
      age: '',
      condition: '',
      phone: '',
    });
    setShowAddModal(false);
    Alert.alert('Sucesso', 'Paciente adicionado com sucesso!');
  };

  const handleViewPatient = (patient) => {
    navigation.navigate('PatientDetail', { patient });
  };

  const handleEditPatient = (patient) => {
    // Implementar edição de paciente
    Alert.alert('Editar Paciente', `Editar ${patient.name}`);
  };

  const handleDeletePatient = (patient) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o paciente ${patient.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setPatients(patients.filter(p => p.id !== patient.id));
            Alert.alert('Sucesso', 'Paciente excluído com sucesso!');
          },
        },
      ]
    );
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return '#10B981'; // Verde
    if (score >= 60) return '#F59E0B'; // Amarelo
    return '#EF4444'; // Vermelho
  };

  const getPerformanceLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Precisa melhorar';
  };

  const renderPatientCard = ({ item: patient }) => (
    <Card style={styles.patientCard}>
      <CardHeader style={styles.patientCardHeader}>
        <View style={styles.patientHeaderRow}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientEmail}>{patient.email}</Text>
            <Text style={styles.patientDetails}>
              {patient.age} anos • {patient.condition}
            </Text>
          </View>
          <View style={styles.patientActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleViewPatient(patient)}
            >
              <Eye size={20} color="#3498DB" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditPatient(patient)}
            >
              <Edit size={20} color="#F59E0B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeletePatient(patient)}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </CardHeader>
      <CardContent style={styles.patientCardContent}>
        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Sessões</Text>
            <Text style={styles.performanceValue}>{patient.totalSessions}</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Score Médio</Text>
            <Text style={[styles.performanceValue, { color: getPerformanceColor(patient.avgScore) }]}>
              {patient.avgScore}%
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Melhoria</Text>
            <Text style={[styles.performanceValue, { color: '#10B981' }]}>
              +{patient.improvement}%
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            Progresso: {getPerformanceLabel(patient.avgScore)}
          </Text>
          <Progress value={patient.avgScore} className="mt-2" />
        </View>

        <View style={styles.gamesRow}>
          <View style={styles.gameItem}>
            <Text style={styles.gameLabel}>Balão</Text>
            <Text style={styles.gameValue}>{patient.gamesPlayed.balloon}</Text>
          </View>
          <View style={styles.gameItem}>
            <Text style={styles.gameLabel}>Barco</Text>
            <Text style={styles.gameValue}>{patient.gamesPlayed.boat}</Text>
          </View>
          <View style={styles.gameItem}>
            <Text style={styles.gameLabel}>Última Atividade</Text>
            <Text style={styles.gameValue}>{patient.lastActivity}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Pacientes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <UserPlus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Estatísticas Gerais */}
      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <CardContent style={styles.statsContent}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Users size={24} color="#3498DB" />
                <Text style={styles.statValue}>{patients.length}</Text>
                <Text style={styles.statLabel}>Total de Pacientes</Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={24} color="#10B981" />
                <Text style={styles.statValue}>
                  {patients.filter(p => p.status === 'active').length}
                </Text>
                <Text style={styles.statLabel}>Ativos</Text>
              </View>
              <View style={styles.statItem}>
                <BarChart3 size={24} color="#F59E0B" />
                <Text style={styles.statValue}>
                  {Math.round(patients.reduce((acc, p) => acc + p.avgScore, 0) / patients.length) || 0}%
                </Text>
                <Text style={styles.statLabel}>Score Médio</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Barra de Busca e Filtros */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pacientes..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color="#3498DB" />
        </TouchableOpacity>
      </View>

      {/* Lista de Pacientes */}
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.patientsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de Adicionar Paciente */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Adicionar Paciente</Text>
            <TouchableOpacity onPress={handleAddPatient}>
              <Text style={styles.modalSaveButton}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <Input
                style={styles.input}
                placeholder="Digite o nome completo"
                value={newPatient.name}
                onChangeText={(text) => setNewPatient({ ...newPatient, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail *</Text>
              <Input
                style={styles.input}
                placeholder="Digite o e-mail"
                value={newPatient.email}
                onChangeText={(text) => setNewPatient({ ...newPatient, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Idade *</Text>
              <Input
                style={styles.input}
                placeholder="Digite a idade"
                value={newPatient.age}
                onChangeText={(text) => setNewPatient({ ...newPatient, age: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Condição Médica *</Text>
              <Input
                style={styles.input}
                placeholder="Ex: Asma, DPOC, Bronquite"
                value={newPatient.condition}
                onChangeText={(text) => setNewPatient({ ...newPatient, condition: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <Input
                style={styles.input}
                placeholder="(11) 99999-9999"
                value={newPatient.phone}
                onChangeText={(text) => setNewPatient({ ...newPatient, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de Filtros */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalSaveButton}>Aplicar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Condição Médica</Text>
              <View style={styles.filterOptions}>
                {['all', 'Asma', 'DPOC', 'Bronquite'].map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.filterOption,
                      filterOptions.condition === condition && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilterOptions({ ...filterOptions, condition })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterOptions.condition === condition && styles.filterOptionTextActive,
                      ]}
                    >
                      {condition === 'all' ? 'Todas' : condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Desempenho</Text>
              <View style={styles.filterOptions}>
                {['all', 'high', 'medium', 'low'].map((performance) => (
                  <TouchableOpacity
                    key={performance}
                    style={[
                      styles.filterOption,
                      filterOptions.performance === performance && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilterOptions({ ...filterOptions, performance })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterOptions.performance === performance && styles.filterOptionTextActive,
                      ]}
                    >
                      {performance === 'all' ? 'Todos' : 
                       performance === 'high' ? 'Alto (≥80%)' :
                       performance === 'medium' ? 'Médio (60-79%)' : 'Baixo (<60%)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Última Atividade</Text>
              <View style={styles.filterOptions}>
                {['all', '7', '30', '90'].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.filterOption,
                      filterOptions.lastActivity === days && styles.filterOptionActive,
                    ]}
                    onPress={() => setFilterOptions({ ...filterOptions, lastActivity: days })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterOptions.lastActivity === days && styles.filterOptionTextActive,
                      ]}
                    >
                      {days === 'all' ? 'Todos' : `Últimos ${days} dias`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsContent: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  patientsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientCardHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  patientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  patientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientCardContent: {
    padding: 20,
    paddingTop: 0,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameItem: {
    alignItems: 'center',
  },
  gameLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  gameValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#64748B',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#3498DB',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterOptionActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#64748B',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
});
