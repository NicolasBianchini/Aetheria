import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
    Animated,
    ActivityIndicator,
} from 'react-native';
import BreathDetectionService from '../services/BreathDetectionService';

const { width } = Dimensions.get('window');

const BreathTestScreen = ({ navigation }) => {
    const [breathService] = useState(new BreathDetectionService());
    const [isDetecting, setIsDetecting] = useState(false);
    const [audioPermission, setAudioPermission] = useState(false);
    const [isCalibrating, setIsCalibrating] = useState(false);

    // Dados de análise em tempo real
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [breathDetections, setBreathDetections] = useState([]);
    const [detectionStats, setDetectionStats] = useState(null);

    // Animações
    const pulseAnim = new Animated.Value(1);
    const intensityAnim = new Animated.Value(0);
    const frequencyAnim = new Animated.Value(0);

    useEffect(() => {
        initializeBreathService();
        return () => {
            breathService.cleanup();
        };
    }, []);

    useEffect(() => {
        if (isDetecting) {
            // Animação de pulso durante detecção
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isDetecting]);

    useEffect(() => {
        if (currentAnalysis) {
            // Animar indicadores baseado na análise
            Animated.timing(intensityAnim, {
                toValue: currentAnalysis.intensity * 100,
                duration: 200,
                useNativeDriver: false,
            }).start();

            Animated.timing(frequencyAnim, {
                toValue: Math.min(currentAnalysis.frequency / 10, 100),
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [currentAnalysis]);

    const initializeBreathService = async () => {
        try {
            const hasPermission = await breathService.initialize();
            setAudioPermission(hasPermission);

            if (!hasPermission) {
                Alert.alert(
                    'Permissão Necessária',
                    'Este app precisa de permissão para acessar o microfone para detectar sopros.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erro ao inicializar serviço de sopro:', error);
        }
    };

    const startBreathDetection = async () => {
        if (!audioPermission) {
            Alert.alert('Erro', 'Permissão de microfone não concedida');
            return;
        }

        try {
            await breathService.startBreathDetection(
                onBreathDetected,
                onAnalysisUpdate
            );
            setIsDetecting(true);
            console.log('Detecção de sopro iniciada');
        } catch (error) {
            console.error('Erro ao iniciar detecção:', error);
            Alert.alert('Erro', 'Não foi possível iniciar a detecção de sopro');
        }
    };

    const stopBreathDetection = async () => {
        if (!isDetecting) return;

        try {
            setIsDetecting(false);
            await breathService.stopBreathDetection();

            // Atualizar estatísticas
            const stats = breathService.getDetectionStats();
            setDetectionStats(stats);

            console.log('Detecção de sopro finalizada');
        } catch (error) {
            console.error('Erro ao parar detecção:', error);
            Alert.alert('Erro', 'Não foi possível parar a detecção');
        }
    };

    const onBreathDetected = (breathData) => {
        console.log('Sopro detectado:', breathData);

        const newDetection = {
            ...breathData,
            id: Date.now(),
        };

        setBreathDetections(prev => [newDetection, ...prev.slice(0, 9)]); // Manter apenas 10 últimas

        // Feedback visual/sonoro
        Alert.alert(
            'Sopro Detectado!',
            `Tipo: ${breathData.type}\nIntensidade: ${(breathData.intensity * 100).toFixed(1)}%\nConfiança: ${(breathData.confidence * 100).toFixed(1)}%`
        );
    };

    const onAnalysisUpdate = (analysisData) => {
        setCurrentAnalysis(analysisData);
    };

    const calibrateSensitivity = async () => {
        setIsCalibrating(true);

        try {
            const calibrationData = await breathService.calibrateSensitivity();

            Alert.alert(
                'Calibração Concluída',
                `Limiar otimizado: ${(calibrationData.optimalThreshold * 100).toFixed(1)}%\nRuído ambiente: ${(calibrationData.ambientNoise * 100).toFixed(1)}%`
            );
        } catch (error) {
            console.error('Erro na calibração:', error);
            Alert.alert('Erro', 'Falha na calibração');
        } finally {
            setIsCalibrating(false);
        }
    };

    const clearDetections = () => {
        setBreathDetections([]);
        setDetectionStats(null);
    };

    const getBreathTypeColor = (type) => {
        switch (type) {
            case 'gentle': return '#27AE60'; // Verde
            case 'medium': return '#F39C12'; // Laranja
            case 'strong': return '#E74C3C'; // Vermelho
            default: return '#95A5A6'; // Cinza
        }
    };

    const getBreathTypeEmoji = (type) => {
        switch (type) {
            case 'gentle': return '🌬️';
            case 'medium': return '💨';
            case 'strong': return '🌪️';
            default: return '❓';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🌬️ Detecção de Sopro</Text>
                <Text style={styles.subtitle}>Sistema avançado para detectar apenas sopros</Text>
            </View>

            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={[
                    styles.statusText,
                    { color: audioPermission ? '#27AE60' : '#E74C3C' }
                ]}>
                    {audioPermission ? '✅ Permissão concedida' : '❌ Permissão negada'}
                </Text>
            </View>

            {/* Análise em Tempo Real */}
            {currentAnalysis && (
                <View style={styles.analysisContainer}>
                    <Text style={styles.analysisTitle}>Análise em Tempo Real:</Text>

                    <View style={styles.analysisRow}>
                        <Text style={styles.analysisLabel}>Intensidade:</Text>
                        <View style={styles.progressBar}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: intensityAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        backgroundColor: currentAnalysis.isBreath ? '#27AE60' : '#E74C3C',
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.analysisValue}>
                            {(currentAnalysis.intensity * 100).toFixed(1)}%
                        </Text>
                    </View>

                    <View style={styles.analysisRow}>
                        <Text style={styles.analysisLabel}>Frequência:</Text>
                        <View style={styles.progressBar}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: frequencyAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        backgroundColor: '#3498DB',
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.analysisValue}>
                            {currentAnalysis.frequency.toFixed(0)} Hz
                        </Text>
                    </View>

                    <View style={styles.analysisRow}>
                        <Text style={styles.analysisLabel}>Tipo:</Text>
                        <Text style={[
                            styles.analysisValue,
                            { color: getBreathTypeColor(currentAnalysis.breathType) }
                        ]}>
                            {getBreathTypeEmoji(currentAnalysis.breathType)} {currentAnalysis.breathType}
                        </Text>
                    </View>

                    <View style={styles.analysisRow}>
                        <Text style={styles.analysisLabel}>Confiança:</Text>
                        <Text style={[
                            styles.analysisValue,
                            { color: currentAnalysis.confidence > 0.7 ? '#27AE60' : '#E74C3C' }
                        ]}>
                            {(currentAnalysis.confidence * 100).toFixed(1)}%
                        </Text>
                    </View>
                </View>
            )}

            {/* Controles */}
            <View style={styles.controlsContainer}>
                <Animated.View
                    style={[
                        styles.detectionButton,
                        {
                            transform: [{ scale: pulseAnim }],
                            backgroundColor: isDetecting ? '#E74C3C' : '#27AE60',
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.detectionTouchable}
                        onPress={isDetecting ? stopBreathDetection : startBreathDetection}
                        disabled={!audioPermission}
                    >
                        <Text style={styles.detectionIcon}>
                            {isDetecting ? '⏹️' : '🌬️'}
                        </Text>
                        <Text style={styles.detectionText}>
                            {isDetecting ? 'Parar Detecção' : 'Iniciar Detecção'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                    style={styles.calibrateButton}
                    onPress={calibrateSensitivity}
                    disabled={isCalibrating || isDetecting}
                >
                    {isCalibrating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.calibrateText}>🔧 Calibrar</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Estatísticas */}
            {detectionStats && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Estatísticas:</Text>
                    <Text style={styles.statsText}>
                        Total de Detecções: {detectionStats.totalDetections}
                    </Text>
                    <Text style={styles.statsText}>
                        Confiança Média: {(detectionStats.averageConfidence * 100).toFixed(1)}%
                    </Text>
                    <Text style={styles.statsText}>
                        Distribuição: Suaves: {detectionStats.breathTypes.gentle} |
                        Médios: {detectionStats.breathTypes.medium} |
                        Fortes: {detectionStats.breathTypes.strong}
                    </Text>
                </View>
            )}

            {/* Histórico de Detecções */}
            {breathDetections.length > 0 && (
                <View style={styles.historyContainer}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Últimas Detecções:</Text>
                        <TouchableOpacity onPress={clearDetections}>
                            <Text style={styles.clearButton}>Limpar</Text>
                        </TouchableOpacity>
                    </View>

                    {breathDetections.map((detection) => (
                        <View key={detection.id} style={styles.detectionItem}>
                            <Text style={styles.detectionTime}>
                                {new Date(detection.timestamp).toLocaleTimeString()}
                            </Text>
                            <Text style={[
                                styles.detectionType,
                                { color: getBreathTypeColor(detection.type) }
                            ]}>
                                {getBreathTypeEmoji(detection.type)} {detection.type}
                            </Text>
                            <Text style={styles.detectionDetails}>
                                {(detection.intensity * 100).toFixed(1)}% | {(detection.confidence * 100).toFixed(1)}%
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Instruções */}
            <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>Como Funciona:</Text>
                <Text style={styles.instructionsText}>
                    • O sistema analisa frequências específicas do sopro humano{'\n'}
                    • Filtra ruídos de fundo e sons não-sopro{'\n'}
                    • Detecta diferentes tipos: suave, médio, forte{'\n'}
                    • Calibra automaticamente para seu ambiente
                </Text>
            </View>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginRight: 10,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    analysisContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E1E8ED',
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 15,
    },
    analysisRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    analysisLabel: {
        fontSize: 14,
        color: '#34495E',
        width: 80,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#ECF0F1',
        borderRadius: 4,
        marginHorizontal: 10,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    analysisValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2C3E50',
        width: 60,
        textAlign: 'right',
    },
    controlsContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    detectionButton: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginBottom: 15,
    },
    detectionTouchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detectionIcon: {
        fontSize: 40,
        marginBottom: 5,
    },
    detectionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    calibrateButton: {
        backgroundColor: '#3498DB',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    calibrateText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    statsContainer: {
        backgroundColor: '#E8F5E8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#27AE60',
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#27AE60',
        marginBottom: 10,
    },
    statsText: {
        fontSize: 14,
        color: '#2C3E50',
        marginBottom: 5,
    },
    historyContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E1E8ED',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    clearButton: {
        color: '#E74C3C',
        fontSize: 14,
        fontWeight: 'bold',
    },
    detectionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ECF0F1',
    },
    detectionTime: {
        fontSize: 12,
        color: '#7F8C8D',
        width: 80,
    },
    detectionType: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    detectionDetails: {
        fontSize: 12,
        color: '#34495E',
        width: 80,
        textAlign: 'right',
    },
    instructions: {
        backgroundColor: '#E8F4FD',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    instructionsText: {
        fontSize: 14,
        color: '#34495E',
        lineHeight: 20,
    },
    backButton: {
        backgroundColor: '#95A5A6',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BreathTestScreen;
