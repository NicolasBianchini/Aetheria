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

export default function BalloonGame() {
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [soundLevel, setSoundLevel] = useState(0);
    const [balloonSize, setBalloonSize] = useState(1);
    const [clownHeight, setClownHeight] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
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
                    const newSize = Math.min(1 + (randomLevel / 50), 3);
                    const newHeight = Math.min(randomLevel * 2, 200);

                    setBalloonSize(newSize);
                    setClownHeight(newHeight);

                    Animated.timing(balloonAnimation, {
                        toValue: newSize,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();

                    Animated.timing(clownAnimation, {
                        toValue: newHeight,
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
        setBalloonSize(1);
        setClownHeight(0);
        setSoundLevel(0);
        setGameStarted(false);
        balloonAnimation.setValue(1);
        clownAnimation.setValue(0);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎈 Jogo do Balão</Text>
            <Text style={styles.instruction}>
                {!gameStarted
                    ? 'Toque para começar e assopre no microfone para encher o balão e fazer o palhaço subir!'
                    : 'Assopre forte para encher o balão e fazer o palhaço subir mais alto!'
                }
            </Text>

            <View style={styles.gameArea}>
                {/* Chão */}
                <View style={styles.ground} />

                {/* Balão */}
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

                {/* Palhaço */}
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
        backgroundColor: '#FFE4B5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: 20,
        textAlign: 'center',
    },
    instruction: {
        fontSize: 16,
        color: '#A0522D',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    gameArea: {
        width: width - 40,
        height: 300,
        position: 'relative',
        marginBottom: 30,
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
    soundIndicator: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    soundText: {
        fontSize: 16,
        color: '#8B4513',
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
        backgroundColor: '#FF6B6B',
        borderRadius: 10,
    },
    soundValue: {
        fontSize: 14,
        color: '#8B4513',
        fontWeight: 'bold',
    },
    controls: {
        marginTop: 20,
    },
    startButton: {
        backgroundColor: '#FF6B6B',
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
