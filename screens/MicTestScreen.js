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
import { Audio } from 'expo-av';
import { buildApiUrl, apiRequest } from '../config/api';
import { testCreateGame, testAudioProcessing } from '../utils/apiTest';

const { width } = Dimensions.get('window');

const MicTestScreen = ({ navigation }) => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioPermission, setAudioPermission] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [lastResponse, setLastResponse] = useState(null);
    const [audioInfo, setAudioInfo] = useState(null);
    const [apiTestResult, setApiTestResult] = useState(null);

    const pulseAnim = new Animated.Value(1);
    const levelAnim = new Animated.Value(0);

    useEffect(() => {
        requestAudioPermission();
        return () => {
            if (recording) {
                stopRecording();
            }
        };
    }, []);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 0.1);
            }, 100);
        } else {
            setRecordingDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        if (isRecording) {
            // Animação de pulso durante gravação
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Simulação de nível de áudio
            const audioInterval = setInterval(() => {
                const level = Math.random() * 100;
                setAudioLevel(level);
                Animated.timing(levelAnim, {
                    toValue: level,
                    duration: 100,
                    useNativeDriver: false,
                }).start();
            }, 100);

            return () => clearInterval(audioInterval);
        } else {
            pulseAnim.setValue(1);
            levelAnim.setValue(0);
            setAudioLevel(0);
        }
    }, [isRecording]);

    const requestAudioPermission = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            setAudioPermission(status === 'granted');

            if (status !== 'granted') {
                Alert.alert(
                    'Permissão Necessária',
                    'Este app precisa de permissão para acessar o microfone para funcionar corretamente.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erro ao solicitar permissão de áudio:', error);
        }
    };

    const startRecording = async () => {
        if (!audioPermission) {
            Alert.alert('Erro', 'Permissão de microfone não concedida');
            return;
        }

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Configurações otimizadas para gravação
            const recordingOptions = {
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
            };

            const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);

            setRecording(newRecording);
            setIsRecording(true);
            console.log('Gravação iniciada com configurações otimizadas');
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            Alert.alert('Erro', 'Não foi possível iniciar a gravação');
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            setIsRecording(false);
            await recording.stopAndUnloadAsync();

            const uri = recording.getURI();
            console.log('Gravação finalizada:', uri);

            // Processar áudio
            await processAudio(uri);

            setRecording(null);
        } catch (error) {
            console.error('Erro ao parar gravação:', error);
            Alert.alert('Erro', 'Não foi possível parar a gravação');
        }
    };

    const processAudio = async (audioUri) => {
        setIsProcessing(true);

        try {
            // Converter áudio para base64
            const response = await fetch(audioUri);
            const blob = await response.blob();

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];

                // Criar informações do áudio
                const audioInfo = {
                    sampleRate: 16000,
                    channels: 1,
                    format: 'm4a',
                    size: base64Audio.length,
                    timestamp: new Date().toISOString(),
                };

                setAudioInfo(audioInfo);

                // Enviar para o backend
                await sendToBackend(base64Audio, audioInfo);
            };
            reader.readAsDataURL(blob);

        } catch (error) {
            console.error('Erro ao processar áudio:', error);
            Alert.alert('Erro', 'Não foi possível processar o áudio');
            setIsProcessing(false);
        }
    };

    const sendToBackend = async (audioData, audioInfo) => {
        try {
            // Criar jogo no backend
            const createGameUrl = buildApiUrl('/api/games/create');
            const gameData = await apiRequest(createGameUrl, {
                method: 'POST',
                body: JSON.stringify({
                    game_type: 'boat',
                    player_name: 'Audio Test',
                    audio_info: audioInfo,
                }),
            });

            const gameId = gameData.game.game_id;
            console.log('Game ID criado:', gameId);

            // Ativar o jogo antes de enviar áudio
            const startGameUrl = buildApiUrl('/api/games/{gameId}/start', { gameId });
            console.log('Ativando jogo:', startGameUrl);
            await apiRequest(startGameUrl, {
                method: 'POST',
            });
            console.log('Jogo ativado com sucesso');

            // Enviar áudio processado
            const audioUrl = buildApiUrl('/api/games/{gameId}/audio', { gameId });
            console.log('URL de áudio:', audioUrl);
            const result = await apiRequest(audioUrl, {
                method: 'POST',
                body: JSON.stringify({
                    audio_data: audioData,
                    audio_info: audioInfo,
                }),
            });

            setLastResponse({
                success: true,
                gameId,
                result,
                audioInfo,
            });

            Alert.alert(
                'Sucesso!',
                `Áudio processado com sucesso!\nJogo: ${gameId}\nTamanho: ${audioInfo.size} bytes\nTaxa: ${audioInfo.sampleRate}Hz`
            );

        } catch (error) {
            console.error('Erro ao enviar para backend:', error);
            Alert.alert('Erro', `Erro na comunicação com o backend: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDuration = (seconds) => {
        return seconds.toFixed(1) + 's';
    };

    const testApiConnection = async () => {
        try {
            console.log('🔍 Testando conexão com API...');
            const result = await testCreateGame();
            setApiTestResult(result);

            if (result.success) {
                Alert.alert('✅ Teste da API', 'Conexão com backend funcionando perfeitamente!');
            } else {
                Alert.alert('❌ Teste da API', `Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro no teste da API:', error);
            Alert.alert('❌ Erro', `Erro no teste: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🎤 Teste de Microfone</Text>
                <Text style={styles.subtitle}>Teste a gravação e processamento de áudio</Text>
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

            <TouchableOpacity
                style={styles.testApiButton}
                onPress={testApiConnection}
            >
                <Text style={styles.testApiButtonText}>🔧 Testar Conexão com Backend</Text>
            </TouchableOpacity>

            {apiTestResult && (
                <View style={styles.apiTestContainer}>
                    <Text style={styles.apiTestTitle}>Resultado do Teste:</Text>
                    <Text style={[
                        styles.apiTestText,
                        { color: apiTestResult.success ? '#27AE60' : '#E74C3C' }
                    ]}>
                        {apiTestResult.success ? '✅ API funcionando' : `❌ ${apiTestResult.error}`}
                    </Text>
                </View>
            )}

            <View style={styles.micContainer}>
                <Animated.View
                    style={[
                        styles.micButton,
                        {
                            transform: [{ scale: pulseAnim }],
                            backgroundColor: isRecording ? '#E74C3C' : '#3498DB',
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.micTouchable}
                        onPress={isRecording ? stopRecording : startRecording}
                        disabled={!audioPermission || isProcessing}
                    >
                        <Text style={styles.micIcon}>
                            {isRecording ? '⏹️' : '🎤'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {isRecording && (
                    <View style={styles.recordingInfo}>
                        <Text style={styles.recordingText}>
                            Gravando... {formatDuration(recordingDuration)}
                        </Text>

                        <View style={styles.audioLevelContainer}>
                            <Animated.View
                                style={[
                                    styles.audioLevelBar,
                                    {
                                        height: levelAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [5, 50],
                                        }),
                                    },
                                ]}
                            />
                        </View>

                        <Text style={styles.levelText}>
                            Nível: {Math.round(audioLevel)}%
                        </Text>
                    </View>
                )}

                {isProcessing && (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#3498DB" />
                        <Text style={styles.processingText}>Processando áudio...</Text>
                    </View>
                )}
            </View>

            {audioInfo && (
                <View style={styles.audioInfoContainer}>
                    <Text style={styles.audioInfoTitle}>Informações do Áudio:</Text>
                    <Text style={styles.audioInfoText}>
                        Taxa de Amostragem: {audioInfo.sampleRate}Hz{'\n'}
                        Canais: {audioInfo.channels}{'\n'}
                        Formato: {audioInfo.format}{'\n'}
                        Tamanho: {audioInfo.size} bytes{'\n'}
                        Timestamp: {new Date(audioInfo.timestamp).toLocaleTimeString()}
                    </Text>
                </View>
            )}

            {lastResponse && (
                <View style={styles.responseContainer}>
                    <Text style={styles.responseTitle}>Última Resposta:</Text>
                    <Text style={styles.responseText}>
                        Jogo ID: {lastResponse.gameId}{'\n'}
                        Status: {lastResponse.result?.success ? 'Sucesso' : 'Erro'}{'\n'}
                        Dados: {JSON.stringify(lastResponse.result, null, 2)}
                    </Text>
                </View>
            )}

            <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>Instruções:</Text>
                <Text style={styles.instructionsText}>
                    1. Toque no microfone para iniciar a gravação{'\n'}
                    2. Sopre ou faça barulho próximo ao microfone{'\n'}
                    3. Toque novamente para parar e processar{'\n'}
                    4. O áudio será enviado para o backend Python
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
        marginBottom: 30,
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
        marginBottom: 30,
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
    testApiButton: {
        backgroundColor: '#3498DB',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    testApiButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    apiTestContainer: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E1E8ED',
    },
    apiTestTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    apiTestText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    micContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    micButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    micTouchable: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    micIcon: {
        fontSize: 40,
    },
    recordingInfo: {
        alignItems: 'center',
        marginTop: 20,
    },
    recordingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E74C3C',
        marginBottom: 15,
    },
    audioLevelContainer: {
        width: 20,
        height: 60,
        backgroundColor: '#ECF0F1',
        borderRadius: 10,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    audioLevelBar: {
        width: 15,
        backgroundColor: '#27AE60',
        borderRadius: 7.5,
        minHeight: 5,
    },
    levelText: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    processingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    processingText: {
        fontSize: 16,
        color: '#3498DB',
        marginTop: 10,
    },
    audioInfoContainer: {
        backgroundColor: '#E8F5E8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#27AE60',
    },
    audioInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#27AE60',
        marginBottom: 10,
    },
    audioInfoText: {
        fontSize: 14,
        color: '#2C3E50',
        lineHeight: 20,
    },
    responseContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E1E8ED',
    },
    responseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: 10,
    },
    responseText: {
        fontSize: 12,
        color: '#34495E',
        fontFamily: 'monospace',
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

export default MicTestScreen;