import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const { width } = Dimensions.get('window');

export default function PatientDetailScreen({ route, navigation }) {
  const { patient } = route.params;
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [gameStats, setGameStats] = useState({
    balloon: {
      totalSessions: 8,
      avgScore: 85,
      bestScore: 95,
      improvement: 12,
      recentScores: [78, 82, 85, 88, 90, 92, 95],
    },
    boat: {
      totalSessions: 7,
      avgScore: 78,
      bestScore: 88,
      improvement: 8,
      recentScores: [70, 72, 75, 78, 80, 82, 88],
    },
  });

  const periods = [
    { key: 'week', label: '7 dias' },
    { key: 'month', label: '30 dias' },
    { key: 'quarter', label: '3 meses' },
    { key: 'year', label: '1 ano' },
  ];

  const getPerformanceColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Precisa melhorar';
  };

  const renderScoreChart = (scores, gameName) => {
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore || 1;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Evolução - {gameName}</Text>
        <View style={styles.chart}>
          {scores.map((score, index) => {
            const height = ((score - minScore) / range) * 100;
            return (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: `${height}%`,
                      backgroundColor: getPerformanceColor(score),
                    },
                  ]}
                />
                <Text style={styles.chartBarLabel}>{score}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <Text style={styles.chartLegendText}>
            Melhor: {maxScore}% • Pior: {minScore}%
          </Text>
        </View>
      </View>
    );
  };

  const renderGameStats = (gameName, stats) => (
    <Card style={styles.gameStatsCard}>
      <CardHeader>
        <CardTitle style={styles.gameStatsTitle}>
          {gameName === 'balloon' ? '🎈 Jogo do Balão' : '⛵ Jogo do Barco'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessões</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getPerformanceColor(stats.avgScore) }]}>
              {stats.avgScore}%
            </Text>
            <Text style={styles.statLabel}>Score Médio</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {stats.bestScore}%
            </Text>
            <Text style={styles.statLabel}>Melhor Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              +{stats.improvement}%
            </Text>
            <Text style={styles.statLabel}>Melhoria</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>
            Progresso: {getPerformanceLabel(stats.avgScore)}
          </Text>
          <Progress value={stats.avgScore} className="mt-2" />
        </View>

        {renderScoreChart(stats.recentScores, gameName)}
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
          <ArrowLeft size={24} color="#3498DB" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{patient.name}</Text>
          <Text style={styles.headerSubtitle}>{patient.condition}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações do Paciente */}
        <Card style={styles.patientInfoCard}>
          <CardContent>
            <View style={styles.patientInfoRow}>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Idade</Text>
                <Text style={styles.patientInfoValue}>{patient.age} anos</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>E-mail</Text>
                <Text style={styles.patientInfoValue}>{patient.email}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Telefone</Text>
                <Text style={styles.patientInfoValue}>{patient.phone}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Última Atividade</Text>
                <Text style={styles.patientInfoValue}>{patient.lastActivity}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Estatísticas Gerais */}
        <Card style={styles.overviewCard}>
          <CardHeader>
            <CardTitle style={styles.overviewTitle}>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Activity size={24} color="#3498DB" />
                <Text style={styles.overviewStatValue}>{patient.totalSessions}</Text>
                <Text style={styles.overviewStatLabel}>Sessões Totais</Text>
              </View>
              <View style={styles.overviewStat}>
                <Target size={24} color="#10B981" />
                <Text style={styles.overviewStatValue}>{patient.avgScore}%</Text>
                <Text style={styles.overviewStatLabel}>Score Médio</Text>
              </View>
              <View style={styles.overviewStat}>
                <TrendingUp size={24} color="#F59E0B" />
                <Text style={styles.overviewStatValue}>+{patient.improvement}%</Text>
                <Text style={styles.overviewStatLabel}>Melhoria</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Filtro de Período */}
        <View style={styles.periodFilter}>
          <Text style={styles.periodFilterLabel}>Período:</Text>
          <View style={styles.periodButtons}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estatísticas dos Jogos */}
        {renderGameStats('balloon', gameStats.balloon)}
        {renderGameStats('boat', gameStats.boat)}

        {/* Recomendações */}
        <Card style={styles.recommendationsCard}>
          <CardHeader>
            <CardTitle style={styles.recommendationsTitle}>
              <Award size={20} color="#F59E0B" />
              {' '}Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Continue praticando o jogo do balão para manter o progresso
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Foque no jogo do barco para melhorar a consistência
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Pratique pelo menos 3 vezes por semana para melhores resultados
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>
                • Considere aumentar a dificuldade dos exercícios
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Play size={20} color="#fff" />
            <Text style={styles.quickActionText}>Iniciar Sessão</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <BarChart3 size={20} color="#fff" />
            <Text style={styles.quickActionText}>Relatório Detalhado</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  patientInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  patientInfoItem: {
    width: '48%',
    marginBottom: 16,
  },
  patientInfoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  patientInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  periodFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  periodFilterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  periodButtonActive: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  gameStatsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gameStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: 8,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarFill: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  chartLegend: {
    alignItems: 'center',
  },
  chartLegendText: {
    fontSize: 12,
    color: '#64748B',
  },
  recommendationsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
