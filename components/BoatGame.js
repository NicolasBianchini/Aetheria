import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function BoatGame() {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [soundLevel, setSoundLevel] = useState(0);
    const [boatPosition, setBoatPosition] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
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
        boatAnimation.setValue(0);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🚤 Jogo do Barquinho</Text>
            <Text style={styles.instruction}>
                {!gameStarted
                    ? 'Toque para começar e assopre no microfone para fazer o barco navegar!'
                    : 'Assopre forte para fazer o barco navegar mais rápido!'
                }
            </Text>

            <View style={styles.gameArea}>
                {/* Água */}
                <View style={styles.water} />

                {/* Barco */}
                <Animated.View
                    style={[
                        styles.boat,
                        {
                            transform: [{ translateX: boatAnimation }],
                        },
                    ]}
                >
                    <Text style={styles.boatEmoji}>🚤</Text>
                </Animated.View>

                {/* Indicador de nível de sopro */}
                {gameStarted && (
                    <View style={styles.soundIndicator}>
                        <Text style={styles.soundText}>Força do sopro:</Text>
                        <View style={styles.soundBar}>
                            <View
                                style={[
                                    styles.soundLevel,
                                    { width: `${soundLevel}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.soundValue}>{Math.round(soundLevel)}%</Text>
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                {!gameStarted ? (
                    <TouchableOpacity style={styles.startButton} onPress={startGame}>
                        <Text style={styles.buttonText}>Começar Jogo</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                        <Text style={styles.buttonText}>Jogar Novamente</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#87CEEB',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 20,
        textAlign: 'center',
    },
    instruction: {
        fontSize: 16,
        color: '#34495E',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    gameArea: {
        width: width - 40,
        height: 200,
        position: 'relative',
        marginBottom: 30,
    },
    water: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#4682B4',
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
    soundIndicator: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    soundText: {
        fontSize: 16,
        color: '#2C3E50',
        marginBottom: 10,
    },
    soundBar: {
        width: 200,
        height: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 5,
    },
    soundLevel: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 10,
    },
    soundValue: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: 'bold',
    },
    controls: {
        marginTop: 20,
    },
    startButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    resetButton: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
