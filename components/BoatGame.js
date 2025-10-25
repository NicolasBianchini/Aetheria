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

export default function BoatGame({ navigation }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [soundLevel, setSoundLevel] = useState(0);
    const [boatPosition, setBoatPosition] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const boatAnimation = useRef(new Animated.Value(0)).current;
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

                    // Mover barco baseado no nível de som
                    const newPosition = Math.min(boatPosition + (randomLevel / 10), width - 100);
                    setBoatPosition(newPosition);

                    Animated.timing(boatAnimation, {
                        toValue: newPosition,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();

                    if (newPosition >= width - 100 && !gameComplete) {
                        setGameComplete(true);
                        setScore(prev => prev + 100);
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
        setBoatPosition(0);
        setSoundLevel(0);
        setGameStarted(false);
        setGameComplete(false);
        boatAnimation.setValue(0);
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
                    <Text style={styles.headerTitle}>Barquinho</Text>
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
                    <Text style={styles.title}>Faça o barco navegar!</Text>
                    <Text style={styles.subtitle}>
                        Assopre no microfone para mover o barco até o final
                    </Text>
                </View>

                {/* Ocean Scene */}
                <View style={styles.gameArea}>
                    {/* Waves */}
                    <View style={styles.waves}>
                        <View style={styles.wave} />
                    </View>

                    {/* Boat */}
                    <Animated.View
                        style={[
                            styles.boat,
                            {
                                transform: [{ translateX: boatAnimation }],
                            },
                        ]}
                    >
                        <Text style={styles.boatEmoji}>⛵</Text>
                    </Animated.View>

                    {/* Finish Line */}
                    <View style={styles.finishLine}>
                        <Text style={styles.finishFlag}>🏁</Text>
                    </View>

                    {/* Clouds */}
                    <View style={styles.clouds}>
                        <Text style={styles.cloud}>☁️</Text>
                        <Text style={[styles.cloud, styles.cloud2]}>☁️</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progresso</Text>
                        <Text style={styles.progressValue}>{Math.round(boatPosition)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${boatPosition}%` }]} />
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
                {gameComplete && (
                    <View style={styles.successMessage}>
                        <Text style={styles.successTitle}>Parabéns! Você completou o desafio!</Text>
                        <Text style={styles.successSubtitle}>+100 pontos</Text>
                    </View>
                )}

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>Dicas:</Text>
                    <View style={styles.tipsList}>
                        <Text style={styles.tip}>• Respire fundo antes de soprar</Text>
                        <Text style={styles.tip}>• Mantenha um sopro constante e controlado</Text>
                        <Text style={styles.tip}>• Pratique respiração diafragmática para melhores resultados</Text>
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
        height: 200,
        backgroundColor: '#87CEEB',
        borderRadius: 16,
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    waves: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#4682B4',
        borderRadius: 10,
    },
    wave: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        height: 20,
        backgroundColor: '#5A9BD4',
        borderRadius: 10,
    },
    boat: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        width: 60,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boatEmoji: {
        fontSize: 40,
    },
    finishLine: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#F59E0B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    finishFlag: {
        fontSize: 24,
        marginTop: 20,
    },
    clouds: {
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    cloud: {
        fontSize: 32,
        opacity: 0.7,
    },
    cloud2: {
        opacity: 0.5,
    },
    progressSection: {
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1E293B',
    },
    progressBar: {
        height: 12,
        backgroundColor: '#E2E8F0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3498DB',
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
        backgroundColor: '#3498DB',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#3498DB',
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
