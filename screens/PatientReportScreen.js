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
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, Award, BarChart3, Target } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PatientReportScreen({ navigation, route }) {
  const { patient } = route.params;
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [weeklyData, setWeeklyData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    loadComparisonData();
  }, [patient, selectedPeriod]);

  const loadComparisonData = () => {
    // Simular dados de semanas anteriores
    const mockSessions = [
      { week: 'Semana 1', sessions: 3, avgScore: 65, totalScore: 195, games: { balloon: 2, boat: 1 } },
      { week: 'Semana 2', sessions: 4, avgScore: 72, totalScore: 288, games: { balloon: 3, boat: 1 } },
      { week: 'Semana 3', sessions: 5, avgScore: 78, totalScore: 390, games: { balloon: 3, boat: 2 } },
      { week: 'Semana 4', sessions: 4, avgScore: 82, totalScore: 328, games: { balloon: 2, boat: 2 } },
    ];

    setWeeklyData(mockSessions);

    if (mockSessions.length >= 2) {
      const lastWeek = mockSessions[mockSessions.length - 1];
      const previousWeek = mockSessions[mockSessions.length - 2];

      setComparisonData({
        sessionsChange: lastWeek.sessions - previousWeek.sessions,
        avgScoreChange: lastWeek.avgScore - previousWeek.avgScore,
        totalScoreChange: lastWeek.totalScore - previousWeek.totalScore,
        balloonChange: lastWeek.games.balloon - previousWeek.games.balloon,
        boatChange: lastWeek.games.boat - previousWeek.games.boat,
      });
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp size={16} color="#10B981" />;
    if (value < 0) return <TrendingDown size={16} color="#EF4444" />;
    return <Minus size={16} color="#64748B" />;
  };

  const getTrendColor = (value) => {
    if (value > 0) return '#10B981';
    if (value < 0) return '#EF4444';
    return '#64748B';
  };

  const calculateProgressPercent = () => {
    if (!weeklyData.length) return 0;
    const firstWeek = weeklyData[0];
    const lastWeek = weeklyData[weeklyData.length - 1];
    return Math.round(((lastWeek.avgScore - firstWeek.avgScore) / firstWeek.avgScore) * 100);
  };

  const formatWeekRange = (weekIndex) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (weeklyData.length - weekIndex) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Relatório Detalhado</Text>
          <Text style={styles.headerSubtitle}>{patient.name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo Geral */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumo Geral</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>+{calculateProgressPercent()}%</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Target size={24} color="#3498DB" />
              <Text style={styles.summaryValue}>{patient.totalSessions || 0}</Text>
              <Text style={styles.summaryLabel}>Sessões Totais</Text>
            </View>
            <View style={styles.summaryCard}>
              <Award size={24} color="#10B981" />
              <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                {patient.avgScore || 0}%
              </Text>
              <Text style={styles.summaryLabel}>Score Médio</Text>
            </View>
            <View style={styles.summaryCard}>
              <TrendingUp size={24} color="#F59E0B" />
              <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                +{patient.improvement || 0}%
              </Text>
              <Text style={styles.summaryLabel}>Melhoria</Text>
            </View>
          </View>
        </View>

        {/* Comparação Semanal */}
        {comparisonData && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comparação Semanal</Text>
              <Text style={styles.sectionSubtitle}>Última vs Anterior</Text>
            </View>

            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonItem}>
                <View style={styles.comparisonIcon}>
                  {getTrendIcon(comparisonData.sessionsChange)}
                </View>
                <View style={styles.comparisonContent}>
                  <Text style={styles.comparisonLabel}>Sessões</Text>
                  <Text style={[
                    styles.comparisonValue,
                    { color: getTrendColor(comparisonData.sessionsChange) }
                  ]}>
                    {comparisonData.sessionsChange > 0 ? '+' : ''}{comparisonData.sessionsChange}
                  </Text>
                </View>
              </View>

              <View style={styles.comparisonItem}>
                <View style={styles.comparisonIcon}>
                  {getTrendIcon(comparisonData.avgScoreChange)}
                </View>
                <View style={styles.comparisonContent}>
                  <Text style={styles.comparisonLabel}>Score Médio</Text>
                  <Text style={[
                    styles.comparisonValue,
                    { color: getTrendColor(comparisonData.avgScoreChange) }
                  ]}>
                    {comparisonData.avgScoreChange > 0 ? '+' : ''}{comparisonData.avgScoreChange}%
                  </Text>
                </View>
              </View>

              <View style={styles.comparisonItem}>
                <View style={styles.comparisonIcon}>
                  {getTrendIcon(comparisonData.balloonChange)}
                </View>
                <View style={styles.comparisonContent}>
                  <Text style={styles.comparisonLabel}>Jogo do Balão</Text>
                  <Text style={[
                    styles.comparisonValue,
                    { color: getTrendColor(comparisonData.balloonChange) }
                  ]}>
                    {comparisonData.balloonChange > 0 ? '+' : ''}{comparisonData.balloonChange}
                  </Text>
                </View>
              </View>

              <View style={styles.comparisonItem}>
                <View style={styles.comparisonIcon}>
                  {getTrendIcon(comparisonData.boatChange)}
                </View>
                <View style={styles.comparisonContent}>
                  <Text style={styles.comparisonLabel}>Jogo do Barco</Text>
                  <Text style={[
                    styles.comparisonValue,
                    { color: getTrendColor(comparisonData.boatChange) }
                  ]}>
                    {comparisonData.boatChange > 0 ? '+' : ''}{comparisonData.boatChange}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Evolução Temporal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Evolução Semanal</Text>
            <Text style={styles.sectionSubtitle}>Últimas 4 semanas</Text>
          </View>

          {weeklyData.map((week, index) => (
            <View key={index} style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <View style={styles.weekInfo}>
                  <Text style={styles.weekTitle}>{week.week}</Text>
                  <Text style={styles.weekDate}>{formatWeekRange(index)}</Text>
                </View>
                <View style={styles.weekBadge}>
                  <Award size={14} color="#F59E0B" />
                  <Text style={styles.weekBadgeText}>{week.avgScore}%</Text>
                </View>
              </View>

              <View style={styles.weekStats}>
                <View style={styles.weekStat}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.weekStatLabel}>Sessões: {week.sessions}</Text>
                </View>
                <View style={styles.weekStat}>
                  <BarChart3 size={16} color="#64748B" />
                  <Text style={styles.weekStatLabel}>Total: {week.totalScore} pts</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${week.avgScore}%` }
                  ]}
                />
              </View>

              <View style={styles.gamesBreakdown}>
                <View style={styles.gameBreakdownItem}>
                  <Text style={styles.gameBreakdownEmoji}>🎈</Text>
                  <Text style={styles.gameBreakdownLabel}>Balão: {week.games.balloon}</Text>
                </View>
                <View style={styles.gameBreakdownItem}>
                  <Text style={styles.gameBreakdownEmoji}>⛵</Text>
                  <Text style={styles.gameBreakdownLabel}>Barco: {week.games.boat}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Gráfico de Evolução */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolução de Score (%)</Text>
          <View style={styles.chart}>
            {weeklyData.map((week, index) => {
              const maxScore = 100;
              const height = (week.avgScore / maxScore) * 120;
              const isBest = week.avgScore === Math.max(...weeklyData.map(w => w.avgScore));
              
              return (
                <View key={index} style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartBarFill,
                      { 
                        height: height,
                        backgroundColor: isBest ? '#10B981' : '#3498DB'
                      }
                    ]}
                  />
                  <Text style={styles.chartBarLabel}>{week.avgScore}%</Text>
                  <Text style={styles.chartBarWeek}>Semana {index + 1}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recomendações */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Análise e Recomendações</Text>
          </View>
          
          <View style={styles.recommendationsList}>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: '#10B981' }]} />
              <Text style={styles.recommendationText}>
                Seu progresso está {comparisonData?.avgScoreChange > 0 ? 'excelente' : 'bom'}. Continue mantendo a consistência.
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.recommendationText}>
                Pratique pelo menos 4-5 vezes por semana para melhores resultados.
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: '#3498DB' }]} />
              <Text style={styles.recommendationText}>
                Foque em ambos os jogos para desenvolver capacidades respiratórias completas.
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <View style={[styles.recommendationBullet, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.recommendationText}>
                Considere aumentar gradualmente a dificuldade dos exercícios.
              </Text>
            </View>
          </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  progressBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  comparisonGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  comparisonIcon: {
    width: 32,
    alignItems: 'center',
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  weekCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  weekDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  weekStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  weekStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weekStatLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  gamesBreakdown: {
    flexDirection: 'row',
    gap: 16,
  },
  gameBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameBreakdownEmoji: {
    fontSize: 16,
  },
  gameBreakdownLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarFill: {
    width: 30,
    borderRadius: 15,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  chartBarWeek: {
    fontSize: 10,
    color: '#64748B',
  },
  recommendationsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

