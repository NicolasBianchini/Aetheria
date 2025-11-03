import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { ArrowLeft, Mic, MicOff, RotateCcw } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BackendGameService from '../services/BackendGameService';

const { width, height } = Dimensions.get('window');

export default function BalloonGame({ navigation }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [soundLevel, setSoundLevel] = useState(0);
    const [balloonSize, setBalloonSize] = useState(20);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [balloonPopped, setBalloonPopped] = useState(false);
    const balloonAnimation = useRef(new Animated.Value(1)).current;
    const recordingRef = useRef(null);
    const backgroundNoiseLevel = useRef([]); // Para calibração de ruído ambiente
    const noiseThreshold = useRef(null); // Threshold dinâmico baseado no ruído

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    const startGame = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permissão de microfone necessária para jogar!');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Criar jogo no backend Python
            const gameInfo = await BackendGameService.createGame('balloon', 'Jogador');
            await BackendGameService.startGame(gameInfo.game_id);

            setGameStarted(true);
            startRecording();
        } catch (error) {
            console.error('Erro ao iniciar jogo no backend:', error);
            alert('Erro ao conectar ao backend. Verifique se o servidor está rodando.');
        }
    };

    const startRecording = async () => {
        try {
            // Configurar opções de gravação com metering habilitado
            const recordingOptions = {
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 44100,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
                // ATIVAR METERING PARA DETECÇÃO REAL DE SOPRO
                isMeteringEnabled: true,
            };

            const { recording } = await Audio.Recording.createAsync(recordingOptions);
            setRecording(recording);
            setIsRecording(true);
            recordingRef.current = recording;

            // USAR DETECÇÃO REAL DE ÁUDIO através do metering
            const interval = setInterval(async () => {
                // Verificar se o jogo foi iniciado antes de processar áudio
                // Mas permitir processar mesmo se não estiver ativo (processAudio vai iniciar automaticamente)
                if (!BackendGameService.currentGameId) {
                    console.warn('⚠️ Jogo não criado ainda, aguardando...');
                    return; // Pular apenas se não tiver gameId
                }
                
                if (recordingRef.current) {
                    try {
                        const status = await recordingRef.current.getStatusAsync();
                        
                        if (status.isRecording && status.metering !== undefined) {
                            // USAR DADOS REAIS DO MICROFONE através do metering
                            const meteringDB = status.metering;
                            
                            let normalizedLevel = 0;
                            
                            // CALIBRAÇÃO DINÂMICA: Calcular ruído ambiente médio nos primeiros segundos
                            if (backgroundNoiseLevel.current.length < 30) {
                                // Primeiros 30 frames (~3 segundos a 100ms) para calibrar ruído ambiente
                                backgroundNoiseLevel.current.push(meteringDB);
                                normalizedLevel = 0; // Zerar durante calibração
                                if (backgroundNoiseLevel.current.length === 30) {
                                    // Calcular threshold após calibração
                                    const sorted = [...backgroundNoiseLevel.current].sort((a, b) => a - b);
                                    // Usar mediana (50%) para ser mais robusto a outliers
                                    const medianNoise = sorted[15];
                                    // Calcular desvio padrão simples (diferença entre quartis)
                                    const q1 = sorted[7]; // 25%
                                    const q3 = sorted[22]; // 75%
                                    const iqr = q3 - q1; // Interquartile range
                                    
                                    // Threshold dinâmico: calcular baseado no ruído ambiente
                                    // IMPORTANTE: Se a mediana for muito alta (> -30 dB), ambiente está muito barulhento
                                    // Usar threshold fixo baseado no ambiente
                                    let calculatedThreshold;
                                    
                                    if (medianNoise > -30) {
                                        // Ambiente MUITO barulhento (mediana > -30 dB) - usar threshold fixo alto
                                        calculatedThreshold = -40;
                                        console.log(`⚠️ Ambiente muito barulhento (mediana: ${medianNoise.toFixed(2)} dB), usando threshold fixo: -40 dB`);
                                    } else if (medianNoise > -45) {
                                        // Ambiente barulhento (mediana entre -30 e -45 dB) - usar threshold fixo
                                        calculatedThreshold = -45;
                                        console.log(`⚠️ Ambiente barulhento (mediana: ${medianNoise.toFixed(2)} dB), usando threshold fixo: -45 dB`);
                                    } else {
                                        // Ambiente normal ou silencioso - usar threshold dinâmico
                                        calculatedThreshold = medianNoise + 5 + (iqr * 0.1);
                                        // Limitar entre -60 e -50 dB
                                        if (calculatedThreshold > -50) {
                                            calculatedThreshold = -50;
                                        } else if (calculatedThreshold < -60) {
                                            calculatedThreshold = -55;
                                        }
                                    }
                                    
                                    // Garantir que threshold seja sempre negativo e razoável
                                    if (calculatedThreshold > 0) {
                                        // Se threshold for positivo, usar valor fixo
                                        calculatedThreshold = -45;
                                        console.log(`⚠️ Threshold positivo detectado, usando fallback: -45 dB`);
                                    } else if (calculatedThreshold > -30) {
                                        // Se threshold estiver muito alto (> -30 dB), limitar
                                        calculatedThreshold = -40;
                                        console.log(`⚠️ Threshold muito alto (${calculatedThreshold.toFixed(2)} dB), limitando para: -40 dB`);
                                    }
                                    
                                    noiseThreshold.current = calculatedThreshold;
                                    console.log(`🎯 Calibração concluída - Mediana: ${medianNoise.toFixed(2)} dB, IQR: ${iqr.toFixed(2)} dB, Threshold: ${noiseThreshold.current.toFixed(2)} dB`);
                                }
                            } else {
                                // Usar threshold dinâmico calculado (FIXO após calibração)
                                if (noiseThreshold.current === null) {
                                    // Fallback se não calibrou - usar threshold conservador
                                    noiseThreshold.current = -55;
                                    console.log(`⚠️ Calibração não concluída, usando threshold padrão: -55 dB`);
                                }
                                
                                // FILTRO: Só processar se estiver significativamente acima do threshold
                                // Adicionar margem de segurança para filtrar ruído próximo ao threshold
                                const safetyMargin = 3; // dB de margem de segurança acima do threshold
                                const effectiveThreshold = noiseThreshold.current + safetyMargin;
                                
                                if (meteringDB < effectiveThreshold) {
                                    normalizedLevel = 0; // Ruído ambiente ou muito próximo do threshold, ignorar
                                } else {
                                    // Calcular nível normalizado acima do threshold efetivo
                                    const minDB = effectiveThreshold;
                                    const maxDB = -10; // Sopro direto no microfone (muito forte)
                                    normalizedLevel = ((meteringDB - minDB) / (maxDB - minDB)) * 100;
                                    normalizedLevel = Math.max(0, Math.min(100, normalizedLevel));
                                    
                                    // Aplicar curva de potência moderada para reduzir ruído residual
                                    normalizedLevel = Math.pow(normalizedLevel / 100, 2.0) * 100;
                                    
                                    // Filtro adicional: só considerar se for significativo (>= 15%)
                                    // Aumentado de 10% para 15% para filtrar melhor ruído externo
                                    if (normalizedLevel < 15) {
                                        normalizedLevel = 0; // Muito baixo, ignorar
                                    }
                                }
                                
                                // Debug: log quando detectar algo
                                if (normalizedLevel > 0) {
                                    console.log(`🎤 Sopro detectado: ${meteringDB.toFixed(2)} dB → ${normalizedLevel.toFixed(1)}% (Threshold efetivo: ${effectiveThreshold.toFixed(2)} dB)`);
                                }
                            }
                            
                            // Log apenas quando houver mudança significativa ou durante calibração
                            if (backgroundNoiseLevel.current.length < 30 || normalizedLevel > 0) {
                                console.log(`🎤 Metering: ${meteringDB.toFixed(2)} dB → ${normalizedLevel.toFixed(1)}% (Threshold: ${noiseThreshold.current ? noiseThreshold.current.toFixed(2) : 'calibrando'} dB)`);
                            }
                            
                            setSoundLevel(normalizedLevel);

                            // ENVIAR PARA BACKEND PYTHON - backend controla tamanho do balão
                            try {
                                const gameState = await BackendGameService.processAudio(normalizedLevel / 100, meteringDB);
                                
                                // BACKEND CONTROLA: tamanho do balão, pressão, estouro, etc.
                                // gameState.balloon_size_percent já vem em porcentagem (20-200%)
                                const newSize = gameState.balloon_size_percent || 20;
                                
                                setBalloonSize(newSize);

                                // Animar escala do balão (inflando)
                                Animated.timing(balloonAnimation, {
                                    toValue: newSize / 20, // Escala de 1x até 10x
                                    duration: 100,
                                    useNativeDriver: true,
                                }).start();

                                // Atualizar score do backend (vem direto no gameState)
                                setScore(gameState.score || 0);

                                // Verificar se o balão estourou (backend retorna)
                                if (gameState.is_balloon_popped && !balloonPopped) {
                                    setBalloonPopped(true);
                                    console.log('💥 Balão estourou!');
                                    
                                    // Parar gravação quando estourar
                                    if (recordingRef.current) {
                                        stopRecording();
                                    }
                                    await BackendGameService.endGame();
                                } else if (gameState.is_balloon_full && !gameComplete && !balloonPopped) {
                                    // Meta: encher até 80% (backend retorna is_balloon_full)
                                    setGameComplete(true);
                                    console.log('🎉 Parabéns! Balão enchido com sucesso!');
                                }
                            } catch (error) {
                                console.error('Erro ao processar no backend:', error);
                            }
                        }
                    } catch (error) {
                        console.error('Erro ao obter status do áudio:', error);
                    }
                }
            }, 100);

            // Parar após 10 segundos
            setTimeout(() => {
                clearInterval(interval);
                stopRecording();
            }, 10000);
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
        }
    };

    const stopRecording = async () => {
        if (recording) {
            await recording.stopAndUnloadAsync();
            setRecording(null);
            setIsRecording(false);
        }
        
        // Finalizar jogo no backend Python
        try {
            await BackendGameService.endGame();
            BackendGameService.reset();
        } catch (error) {
            console.error('Erro ao finalizar jogo no backend:', error);
        }
    };

    const resetGame = () => {
        // Resetar frontend
        setBalloonSize(20);
        setSoundLevel(0);
        setGameStarted(false);
        setGameComplete(false);
        setBalloonPopped(false);
        balloonAnimation.setValue(1);
        
        // Resetar calibração de ruído
        backgroundNoiseLevel.current = [];
        noiseThreshold.current = null;
        
        // Resetar backend
        BackendGameService.reset();
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
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Balão do Palhaço</Text>
                    <Text style={styles.headerScore}>Pontos: {score}</Text>
                </View>
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetGame}
                >
                    <RotateCcw size={20} color="#666" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Instructions */}
                <View style={styles.instructions}>
                    <Text style={styles.title}>Encha o balão!</Text>
                    <Text style={styles.subtitle}>
                        Assopre no microfone para encher o balão. Cuidado para não estourar!
                    </Text>
                </View>

                {/* Game Scene */}
                <View style={styles.gameArea}>
                    {/* Ground */}
                    <View style={styles.ground} />

                    {/* Warning Line - quando estiver perto do limite */}
                    {balloonSize >= 180 && !balloonPopped && (
                        <View style={styles.warningLine}>
                            <Text style={styles.warningText}>⚠️ Cuidado! Quase estourando!</Text>
                        </View>
                    )}

                    {/* Balloon - Centralizado */}
                    <View style={styles.balloonContainer}>
                        {!balloonPopped ? (
                            <Animated.View
                                style={[
                                    styles.balloon,
                                    {
                                        transform: [{ scale: balloonAnimation }],
                                    },
                                ]}
                            >
                                <Text style={styles.balloonEmoji}>🎈</Text>
                            </Animated.View>
                        ) : (
                            <View style={styles.balloon}>
                                <Text style={styles.explosionEmoji}>💥</Text>
                            </View>
                        )}
                    </View>

                    {/* Clouds */}
                    <View style={styles.clouds}>
                        <Text style={styles.cloud}>☁️</Text>
                        <Text style={[styles.cloud, styles.cloud2]}>☁️</Text>
                    </View>
                </View>

                {/* Balloon Size Indicator */}
                <View style={styles.balloonSection}>
                    <View style={styles.balloonHeader}>
                        <Text style={styles.balloonLabel}>Tamanho do Balão</Text>
                        <Text style={styles.balloonValue}>{Math.round(balloonSize)}%</Text>
                    </View>
                    <View style={styles.balloonBar}>
                        <View style={[styles.balloonFill, { width: `${balloonSize}%` }]} />
                    </View>
                </View>

                {/* Breath Power Indicator */}
                <View style={styles.breathSection}>
                    <View style={styles.breathHeader}>
                        <Text style={styles.breathLabel}>Força do Sopro</Text>
                        <Text style={styles.breathValue}>{Math.round(soundLevel)}%</Text>
                    </View>
                    <View style={styles.breathBar}>
                        <View style={[styles.breathFill, { width: `${soundLevel}%` }]} />
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    {!isRecording ? (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={startGame}
                        >
                            <Mic size={20} color="#fff" />
                            <Text style={styles.buttonText}>Começar a Soprar</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.stopButton}
                            onPress={stopRecording}
                        >
                            <MicOff size={20} color="#fff" />
                            <Text style={styles.buttonText}>Parar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Game Complete Message */}
                {gameComplete && !balloonPopped && (
                    <View style={styles.successMessage}>
                        <Text style={styles.successTitle}>🎉 Parabéns! Balão enchido com sucesso!</Text>
                        <Text style={styles.successSubtitle}>+150 pontos</Text>
                    </View>
                )}

                {/* Balloon Popped Message */}
                {balloonPopped && (
                    <View style={styles.errorMessage}>
                        <Text style={styles.errorTitle}>💥 Oh não! O balão estourou!</Text>
                        <Text style={styles.errorSubtitle}>-50 pontos. Tente novamente com mais cuidado!</Text>
                    </View>
                )}

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>Dicas:</Text>
                    <View style={styles.tipsList}>
                        <Text style={styles.tip}>• Sopre de forma suave e controlada</Text>
                        <Text style={styles.tip}>• Não sopre muito forte ou o balão vai estourar!</Text>
                        <Text style={styles.tip}>• Encha até 150% para ganhar pontos, mas cuidado com o limite!</Text>
                        <Text style={styles.tip}>• Mantenha a respiração constante para melhores resultados</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    headerScore: {
        fontSize: 12,
        color: '#64748B',
    },
    resetButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    instructions: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '300',
        color: '#1E293B',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    gameArea: {
        height: 300,
        backgroundColor: '#FFE4B5',
        borderRadius: 16,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    ground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: '#8B4513',
        borderRadius: 10,
    },
    targetLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '20%',
        height: 2,
        backgroundColor: '#F59E0B',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#F59E0B',
        alignItems: 'flex-end',
        paddingRight: 16,
    },
    targetText: {
        fontSize: 12,
        color: '#92400E',
        fontWeight: '500',
        marginTop: -8,
    },
    balloonContainer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balloon: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balloonEmoji: {
        fontSize: 40,
    },
    explosionEmoji: {
        fontSize: 80,
    },
    warningLine: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginHorizontal: 20,
    },
    warningText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#DC2626',
    },
    clouds: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    cloud: {
        fontSize: 24,
        opacity: 0.6,
    },
    cloud2: {
        opacity: 0.5,
    },
    balloonSection: {
        marginBottom: 24,
    },
    balloonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    balloonLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    balloonValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    balloonBar: {
        height: 12,
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    balloonFill: {
        height: '100%',
        backgroundColor: '#EF4444',
        borderRadius: 6,
    },
    breathSection: {
        marginBottom: 24,
    },
    breathHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    breathLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    breathValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    breathBar: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    breathFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    controls: {
        marginBottom: 24,
    },
    startButton: {
        height: 56,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#EF4444',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    stopButton: {
        height: 56,
        backgroundColor: '#6B7280',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#6B7280',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#fff',
    },
    successMessage: {
        backgroundColor: '#D1FAE5',
        borderWidth: 1,
        borderColor: '#10B981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#065F46',
        marginBottom: 4,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#047857',
    },
    errorMessage: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#991B1B',
        marginBottom: 4,
    },
    errorSubtitle: {
        fontSize: 14,
        color: '#B91C1C',
    },
    tipsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 12,
    },
    tipsList: {
        gap: 8,
    },
    tip: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
});
