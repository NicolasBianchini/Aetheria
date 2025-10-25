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

const { width, height } = Dimensions.get('window');

export default function BalloonGame({ navigation }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [soundLevel, setSoundLevel] = useState(0);
    const [balloonSize, setBalloonSize] = useState(20);
    const [clownHeight, setClownHeight] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [balloonPopped, setBalloonPopped] = useState(false);
    const balloonAnimation = useRef(new Animated.Value(1)).current;
    const clownAnimation = useRef(new Animated.Value(0)).current;
    const recordingRef = useRef(null);

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

            setGameStarted(true);
            startRecording();
        } catch (error) {
            console.error('Erro ao iniciar jogo:', error);
        }
    };

    const startRecording = async () => {
        try {
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            recordingRef.current = recording;

            // Simular detecção de nível de som
            const interval = setInterval(() => {
                if (recordingRef.current) {
                    // Simular nível de sopro baseado em tempo
                    const randomLevel = Math.random() * 100;
                    setSoundLevel(randomLevel);

                    // Aumentar tamanho do balão e altura do palhaço baseado no sopro
                    const newSize = Math.min(20 + (randomLevel / 2), 100);
                    const newHeight = Math.min(randomLevel * 2, 200);

                    setBalloonSize(newSize);
                    setClownHeight(newHeight);

                    Animated.timing(balloonAnimation, {
                        toValue: newSize / 20,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();

                    Animated.timing(clownAnimation, {
                        toValue: newHeight,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();

                    if (newSize >= 100 && !gameComplete) {
                        setGameComplete(true);
                        setScore(prev => prev + 150);
                    }
                    if (newSize >= 110) {
                        setBalloonPopped(true);
                        setScore(prev => prev - 50);
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
    };

    const resetGame = () => {
        setBalloonSize(20);
        setClownHeight(0);
        setSoundLevel(0);
        setGameStarted(false);
        setGameComplete(false);
        setBalloonPopped(false);
        balloonAnimation.setValue(1);
        clownAnimation.setValue(0);
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
                        Assopre no microfone para encher o balão e fazer o palhaço subir
                    </Text>
                </View>

                {/* Game Scene */}
                <View style={styles.gameArea}>
                    {/* Ground */}
                    <View style={styles.ground} />

                    {/* Target Line */}
                    <View style={styles.targetLine}>
                        <Text style={styles.targetText}>Meta</Text>
                    </View>

                    {/* Balloon */}
                    {!balloonPopped ? (
                        <Animated.View
                            style={[
                                styles.balloon,
                                {
                                    transform: [
                                        { scale: balloonAnimation },
                                        { translateY: clownAnimation }
                                    ],
                                },
                            ]}
                        >
                            <Text style={styles.balloonEmoji}>🎈</Text>
                        </Animated.View>
                    ) : (
                        <Animated.View
                            style={[
                                styles.balloon,
                                {
                                    transform: [{ translateY: clownAnimation }],
                                },
                            ]}
                        >
                            <Text style={styles.explosionEmoji}>💥</Text>
                        </Animated.View>
                    )}

                    {/* Clown */}
                    <Animated.View
                        style={[
                            styles.clown,
                            {
                                transform: [{ translateY: clownAnimation }],
                            },
                        ]}
                    >
                        <Text style={styles.clownEmoji}>🤡</Text>
                    </Animated.View>

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
                        <Text style={styles.successTitle}>Parabéns! O palhaço chegou ao topo!</Text>
                        <Text style={styles.successSubtitle}>+150 pontos</Text>
                    </View>
                )}

                {/* Balloon Popped Message */}
                {balloonPopped && (
                    <View style={styles.errorMessage}>
                        <Text style={styles.errorTitle}>Oh não! O balão estourou!</Text>
                        <Text style={styles.errorSubtitle}>-50 pontos. Tente novamente com mais cuidado!</Text>
                    </View>
                )}

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>Dicas:</Text>
                    <View style={styles.tipsList}>
                        <Text style={styles.tip}>• Sopre de forma suave e controlada</Text>
                        <Text style={styles.tip}>• Não sopre muito forte ou o balão vai estourar!</Text>
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
    balloon: {
        position: 'absolute',
        bottom: 60,
        left: width / 2 - 30,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    balloonEmoji: {
        fontSize: 40,
    },
    explosionEmoji: {
        fontSize: 60,
    },
    clown: {
        position: 'absolute',
        bottom: 50,
        left: width / 2 - 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clownEmoji: {
        fontSize: 30,
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
