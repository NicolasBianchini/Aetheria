import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Animated,
    Alert,
} from 'react-native';
import { ArrowLeft, Wind, Mic, MicOff } from 'lucide-react-native';
import { Audio } from 'expo-av';
import FirestoreService from '../services/FirestoreService';
import BackendGameService from '../services/BackendGameService';

const { width, height } = Dimensions.get('window');

export default function BoatGameScreen({ navigation, route }) {
    const { patient } = route.params || {};
    const [boatPosition, setBoatPosition] = useState(0);
    const [isBlowing, setIsBlowing] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [blowIntensity, setBlowIntensity] = useState(0);
    const [blowThreshold, setBlowThreshold] = useState(0.3); // Aumentado para filtrar ruído externo
    const [isBlowingButton, setIsBlowingButton] = useState(false);

    const boatAnimation = new Animated.Value(0);
    const boatPositionAnim = useRef(new Animated.Value(0)).current; // Animação para posição do barco
    const recordingRef = useRef(null);
    const audioHistory = useRef([]);
    const blowCooldown = useRef(0);
    const blowInterval = useRef(null);
    const currentBoatPosition = useRef(0); // Rastrear posição atual para animação fluida
    const backgroundNoiseLevel = useRef([]); // Para calibração de ruído ambiente
    const noiseThreshold = useRef(null); // Threshold dinâmico baseado no ruído

    // Função para detectar padrões de sopro
    const detectBlowPattern = (audioLevel) => {
        const now = Date.now();
        
        // Adicionar nível de áudio ao histórico
        audioHistory.current.push({
            level: audioLevel,
            timestamp: now
        });
        
        // Manter apenas últimos 500ms de histórico
        audioHistory.current = audioHistory.current.filter(
            entry => now - entry.timestamp < 500
        );
        
        // Verificar cooldown para evitar múltiplas detecções
        if (now - blowCooldown.current < 200) {
            return { intensity: audioLevel, isBlow: false };
        }
        
        // Calcular média dos últimos níveis
        const avgLevel = audioHistory.current.reduce((sum, entry) => sum + entry.level, 0) / audioHistory.current.length;
        
        // Detectar picos de áudio (característicos de sopro)
        const recentLevels = audioHistory.current.slice(-5); // Últimos 5 níveis
        const hasPeak = recentLevels.some(entry => entry.level > avgLevel * 1.5);
        
        // Detectar sopro baseado em:
        // 1. Nível de áudio acima do limiar
        // 2. Presença de picos
        // 3. Padrão consistente de aumento
        const isBlow = audioLevel > blowThreshold && hasPeak && avgLevel > blowThreshold * 0.7;
        
        if (isBlow) {
            blowCooldown.current = now;
        }
        
        return {
            intensity: Math.min(audioLevel * 2, 1), // Normalizar intensidade
            isBlow: isBlow
        };
    };

    // Função para detectar sopro usando BACKEND PYTHON
    const startRealBlowDetection = async () => {
        if (isBlowingButton) return;
        
        if (!hasPermission) {
            Alert.alert('Permissão Necessária', 'Ative o acesso ao microfone nas configurações.');
            return;
        }

        try {
            setIsBlowingButton(true);
            setIsRecording(true);
            
            // Criar jogo no backend Python
            const gameInfo = await BackendGameService.createGame('boat', patient?.name || 'Jogador');
            await BackendGameService.startGame(gameInfo.game_id);
            
            if (!gameStarted) {
                setGameStarted(true);
            }

            // Configurar áudio para gravação
            await configureAudio();
            
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync({
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
            });

            await recording.startAsync();
            recordingRef.current = recording;

            // Enviar áudio para backend Python e receber estado do jogo
            blowInterval.current = setInterval(async () => {
                try {
                    // Verificar se o jogo foi criado antes de processar áudio
                    // Mas permitir processar mesmo se não estiver ativo (processAudio vai iniciar automaticamente)
                    if (!BackendGameService.currentGameId) {
                        console.warn('⚠️ Jogo não criado ainda, aguardando...');
                        return; // Pular apenas se não tiver gameId
                    }
                    
                    if (recordingRef.current && !gameFinished) {
                        const status = await recordingRef.current.getStatusAsync();
                        
                        if (status.isRecording && status.metering !== undefined) {
                            const meteringDB = status.metering;
                            
                            let audioLevel = 0;
                            
                            // CALIBRAÇÃO DINÂMICA: Calcular ruído ambiente médio nos primeiros segundos
                            if (backgroundNoiseLevel.current.length < 30) {
                                // Primeiros 30 frames (~1.5 segundos a 50ms) para calibrar ruído ambiente
                                backgroundNoiseLevel.current.push(meteringDB);
                                audioLevel = 0; // Zerar durante calibração
                                if (backgroundNoiseLevel.current.length === 30) {
                                    // Calcular threshold após calibração usando mediana (mais robusto)
                                    const sorted = [...backgroundNoiseLevel.current].sort((a, b) => a - b);
                                    const medianNoise = sorted[15]; // Mediana
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
                                    audioLevel = 0; // Ruído ambiente ou muito próximo do threshold, ignorar
                                } else {
                                    // Calcular nível normalizado acima do threshold efetivo
                                    const minDB = effectiveThreshold;
                                    const maxDB = -10; // Sopro direto no microfone (muito forte)
                                    audioLevel = (meteringDB - minDB) / (maxDB - minDB);
                                    audioLevel = Math.max(0, Math.min(1, audioLevel));
                                    
                                    // Aplicar curva de potência moderada para reduzir ruído residual
                                    audioLevel = Math.pow(audioLevel, 2.0);
                                    
                                    // Filtro adicional: só considerar se for significativo (>= 15%)
                                    // Aumentado de 10% para 15% para filtrar melhor ruído externo
                                    if (audioLevel < 0.15) {
                                        audioLevel = 0; // Muito baixo, ignorar
                                    }
                                }
                                
                                // Debug: log quando detectar algo
                                if (audioLevel > 0) {
                                    console.log(`🎤 Sopro detectado: ${meteringDB.toFixed(2)} dB → ${(audioLevel * 100).toFixed(1)}% (Threshold efetivo: ${effectiveThreshold.toFixed(2)} dB)`);
                                }
                            }
                            
                            // ENVIAR PARA BACKEND PYTHON - backend processa e retorna estado do jogo
                            let gameState = null;
                            try {
                                gameState = await BackendGameService.processAudio(audioLevel, meteringDB);
                                
                                if (!gameState) {
                                    console.warn('⚠️ gameState é null, pulando atualização');
                                    return;
                                }
                                
                                // BACKEND CONTROLA: posição do barco, pontuação, velocidade, etc.
                                const boatPositionPercent = gameState.boat_position || 0;
                                const newPosition = (boatPositionPercent / 100) * (width - 100);
                                
                                // Debug: log para verificar valores
                                console.log(`🚤 Barco: ${boatPositionPercent.toFixed(2)}% → ${newPosition.toFixed(0)}px | Intensidade: ${audioLevel.toFixed(2)} | Sopro detectado: ${gameState.blow_detected}`);
                                
                                // Atualizar posição do barco baseado no backend
                                currentBoatPosition.current = newPosition;
                                Animated.timing(boatPositionAnim, {
                                    toValue: currentBoatPosition.current,
                                    duration: 50,
                                    useNativeDriver: true,
                                }).start();
                                
                                setBoatPosition(Math.floor(currentBoatPosition.current));
                                setBlowIntensity(gameState.blow_intensity || 0);
                                setScore(gameState.score || 0); // Score vem direto do backend
                                
                                // Verificar vitória (backend retorna game_progress)
                                if (gameState.game_progress >= 1.0) {
                                    setGameFinished(true);
                                    await BackendGameService.endGame();
                                    saveGameResult();
                                }
                                
                                setIsBlowing(gameState.blow_detected || false);
                            } catch (error) {
                                console.error('Erro ao processar áudio no backend:', error);
                                // Não fazer nada, apenas pular este ciclo
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Erro ao processar áudio no backend:', error);
                }
            }, 50); // Enviar para backend a cada 50ms

        } catch (error) {
            console.error('Erro ao iniciar jogo no backend:', error);
            setIsBlowingButton(false);
            setIsRecording(false);
            Alert.alert(
                'Erro',
                'Não foi possível conectar ao backend. Verifique se o servidor está rodando.',
                [{ text: 'OK' }]
            );
        }
    };

    const stopRealBlowDetection = async () => {
        if (!isBlowingButton) return;
        
        setIsBlowingButton(false);
        setIsRecording(false);
        setBlowIntensity(0);
        
        if (blowInterval.current) {
            clearInterval(blowInterval.current);
            blowInterval.current = null;
        }
        
        // Finalizar jogo no backend Python
        try {
            await BackendGameService.endGame();
            BackendGameService.reset();
        } catch (error) {
            console.error('Erro ao finalizar jogo no backend:', error);
        }
        
        if (recordingRef.current) {
            try {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
            } catch (error) {
                console.error('Erro ao parar gravação:', error);
            }
        }
    };

    // Solicitar permissão do microfone e configurar áudio
    useEffect(() => {
        requestMicrophonePermission();
        configureAudio();
    }, []);

    const configureAudio = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: false,
            });
        } catch (error) {
            console.error('Erro ao configurar áudio:', error);
        }
    };

    const requestMicrophonePermission = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            setHasPermission(status === 'granted');
            if (status !== 'granted') {
                Alert.alert(
                    'Permissão Necessária',
                    'Este jogo precisa de acesso ao microfone para detectar seu sopro.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erro ao solicitar permissão do microfone:', error);
        }
    };

    useEffect(() => {
        if (gameStarted && !gameFinished) {
            // Animação contínua do barco flutuando
            const floatingAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(boatAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(boatAnimation, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            );
            floatingAnimation.start();
        }
    }, [gameStarted, gameFinished]);

    // Detectar sopro através do microfone
    const detectBlow = async () => {
        if (!hasPermission) {
            Alert.alert('Permissão Necessária', 'Ative o acesso ao microfone nas configurações.');
            return;
        }

        try {
            // Garantir que o áudio esteja configurado
            await configureAudio();
            
            setIsRecording(true);
            
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync({
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 2,
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
            });

            await recording.startAsync();
            recordingRef.current = recording;

            // Detectar sopro real através de análise de áudio
            const blowDetectionInterval = setInterval(async () => {
                try {
                    if (recordingRef.current) {
                        // Obter status da gravação para análise
                        const status = await recordingRef.current.getStatusAsync();
                        
                        if (status.isRecording && status.metering !== undefined) {
                            // USAR DADOS REAIS DO MICROFONE através do metering
                            const meteringDB = status.metering;
                            
                            // Converter dB para escala linear 0-1
                            const minDB = -60;
                            const maxDB = -10;
                            let audioLevel = (meteringDB - minDB) / (maxDB - minDB);
                            audioLevel = Math.max(0, Math.min(1, audioLevel));
                            
                            console.log(`🎤 Metering: ${meteringDB.toFixed(2)} dB → Nível: ${(audioLevel * 100).toFixed(1)}%`);
                            
                            // Detectar sopro baseado em padrões de frequência e amplitude
                            const blowPattern = detectBlowPattern(audioLevel);
                            setBlowIntensity(blowPattern.intensity);
                            
                            if (blowPattern.isBlow) {
                                handleBlowDetected();
                                console.log('💨 Sopro detectado!');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Erro na análise de áudio:', error);
                }
            }, 50); // Análise mais frequente para melhor detecção

            // Parar gravação após 3 segundos
            setTimeout(async () => {
                clearInterval(blowDetectionInterval);
                if (recordingRef.current) {
                    await recordingRef.current.stopAndUnloadAsync();
                    recordingRef.current = null;
                }
                setIsRecording(false);
                setBlowIntensity(0);
            }, 3000);

        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            setIsRecording(false);
            Alert.alert(
                'Erro de Gravação',
                'Não foi possível iniciar a gravação. Verifique as permissões do microfone.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleBlowDetected = () => {
        if (!gameStarted) {
            setGameStarted(true);
        }
        
        if (!gameFinished) {
            setIsBlowing(true);
            
            // Mover o barco para a direita baseado na intensidade
            const moveDistance = Math.floor(blowIntensity * 50) + 10;
            const newPosition = Math.min(boatPosition + moveDistance, width - 100);
            setBoatPosition(newPosition);
            setScore(score + Math.floor(blowIntensity * 20) + 5);
            
            // Verificar se chegou ao final
            if (newPosition >= width - 100) {
                setGameFinished(true);
                saveGameResult(); // Salvar resultados ao finalizar
            }
            
            // Parar de soprar após um tempo
            setTimeout(() => {
                setIsBlowing(false);
            }, 300);
        }
    };

    const saveGameResult = async () => {
        if (!patient?.id) return;

        try {
            // Buscar paciente atualizado - usar método de busca direto no Firestore
            const allPatients = await FirestoreService.getPatientsByUser(patient.userId || patient.id);
            const updatedPatient = allPatients.find(p => p.id === patient.id) || patient;
            if (!updatedPatient) return;

            // Calcular novos valores
            const newTotalSessions = (updatedPatient.totalSessions || 0) + 1;
            const newGamesPlayed = {
                ...updatedPatient.gamesPlayed,
                boat: (updatedPatient.gamesPlayed?.boat || 0) + 1
            };

            // Calcular score médio
            const currentAvgScore = updatedPatient.avgScore || 0;
            const totalScores = newTotalSessions - 1;
            const newAvgScore = totalScores > 0 
                ? ((currentAvgScore * totalScores) + score) / newTotalSessions
                : score;

            // Atualizar paciente no Firestore
            await FirestoreService.updatePatient(patient.id, {
                totalSessions: newTotalSessions,
                avgScore: Math.round(newAvgScore),
                gamesPlayed: newGamesPlayed,
                lastActivity: new Date().toISOString().split('T')[0],
                status: 'active'
            });

            console.log('✅ Resultados salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar resultados:', error);
        }
    };

    const resetGame = () => {
        // Resetar frontend
        currentBoatPosition.current = 0;
        boatPositionAnim.setValue(0);
        setBoatPosition(0);
        setGameStarted(false);
        setGameFinished(false);
        setScore(0);
        setIsBlowing(false);
        setIsRecording(false);
        setBlowIntensity(0);
        
        // Resetar calibração de ruído
        backgroundNoiseLevel.current = [];
        noiseThreshold.current = null;
        
        // Resetar backend
        BackendGameService.reset();
    };

    const floatingTransform = boatAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Barquinho</Text>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>Pontos: {score}</Text>
                </View>
            </View>

            {/* Game Area */}
            <View style={styles.gameContainer}>
                {/* Sky Section */}
                <View style={styles.sky}>
                    {/* Clouds */}
                    <View style={styles.cloud1} />
                    <View style={styles.cloud2} />
                    <View style={styles.cloud3} />
                    
                    {/* Sun */}
                    <View style={styles.sun} />
                </View>

                {/* Sea Section */}
                <View style={styles.sea}>
                    {/* Waves */}
                    <View style={styles.wave1} />
                    <View style={styles.wave2} />
                    
                    {/* Sailboat */}
                    <Animated.View 
                        style={[
                            styles.sailboat,
                            {
                                left: 0, // Posição base fixa
                                transform: [
                                    { translateX: boatPositionAnim }, // Movimento horizontal fluido
                                    { translateY: floatingTransform } // Movimento vertical (flutuação)
                                ]
                            }
                        ]}
                    >
                        {/* Sail */}
                        <View style={styles.sail}>
                            <View style={[styles.sailStripe, { backgroundColor: '#DC2626' }]} />
                            <View style={[styles.sailStripe, { backgroundColor: '#EA580C' }]} />
                            <View style={[styles.sailStripe, { backgroundColor: '#FCD34D' }]} />
                            <View style={[styles.sailStripe, { backgroundColor: '#EA580C' }]} />
                            <View style={[styles.sailStripe, { backgroundColor: '#DC2626' }]} />
                        </View>
                        
                        {/* Hull */}
                        <View style={styles.hull}>
                            <View style={styles.hullShadow} />
                        </View>
                    </Animated.View>
                    
                    {/* Finish Line */}
                    <View style={styles.finishLine}>
                        <View style={styles.flag}>
                            <View style={styles.flagStripe1} />
                            <View style={styles.flagStripe2} />
                            <View style={styles.flagStripe3} />
                            <View style={styles.flagStripe4} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Game Status */}
            {!gameStarted && (
                <View style={styles.gameStatus}>
                    <Text style={styles.statusText}>
                        Segure o botão e SOPRE NO MICROFONE para mover o barco!
                    </Text>
                </View>
            )}

            {gameFinished && (
                <View style={styles.gameStatus}>
                    <Text style={styles.winText}>🎉 Parabéns! Você chegou ao final!</Text>
                    <Text style={styles.finalScore}>Pontuação Final: {score}</Text>
                    <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
                        <Text style={styles.resetButtonText}>Jogar Novamente</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Blow Intensity Indicator */}
            {isBlowingButton && (
                <View style={styles.intensityContainer}>
                    <Text style={styles.intensityLabel}>
                        {blowIntensity > blowThreshold ? '🎯 Sopro Detectado!' : '🎤 Sopre no microfone...'}
                    </Text>
                    <View style={styles.intensityBar}>
                        <View 
                            style={[
                                styles.intensityFill, 
                                { 
                                    width: `${(blowIntensity / 0.5) * 100}%`,
                                    backgroundColor: blowIntensity > blowThreshold ? '#EF4444' : '#10B981'
                                }
                            ]} 
                        />
                    </View>
                    <Text style={styles.intensityValue}>
                        {Math.round(blowIntensity * 100)}% - Limiar: {Math.round(blowThreshold * 100)}%
                    </Text>
                </View>
            )}

            {/* Sensitivity Controls */}
            <View style={styles.sensitivityContainer}>
                <Text style={styles.sensitivityLabel}>Sensibilidade:</Text>
                <View style={styles.sensitivityButtons}>
                    <TouchableOpacity
                        style={[styles.sensitivityButton, blowThreshold === 0.2 && styles.sensitivityButtonActive]}
                        onPress={() => setBlowThreshold(0.2)}
                    >
                        <Text style={[styles.sensitivityButtonText, blowThreshold === 0.2 && styles.sensitivityButtonTextActive]}>Alta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sensitivityButton, blowThreshold === 0.3 && styles.sensitivityButtonActive]}
                        onPress={() => setBlowThreshold(0.3)}
                    >
                        <Text style={[styles.sensitivityButtonText, blowThreshold === 0.3 && styles.sensitivityButtonTextActive]}>Média</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sensitivityButton, blowThreshold === 0.4 && styles.sensitivityButtonActive]}
                        onPress={() => setBlowThreshold(0.4)}
                    >
                        <Text style={[styles.sensitivityButtonText, blowThreshold === 0.4 && styles.sensitivityButtonTextActive]}>Baixa</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Blow Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.blowButton, isBlowingButton && styles.blowButtonActive]}
                    onPressIn={startRealBlowDetection}
                    onPressOut={stopRealBlowDetection}
                    disabled={gameFinished}
                >
                    {isBlowingButton ? (
                        <MicOff size={20} color="#fff" />
                    ) : (
                        <Mic size={20} color="#fff" />
                    )}
                    <Text style={styles.blowButtonText}>
                        {isBlowingButton ? 'Soprando...' : 'Segure e Sopre!'}
                    </Text>
                </TouchableOpacity>
            </View>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
    },
    scoreContainer: {
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E40AF',
    },
    gameContainer: {
        flex: 1,
        borderRadius: 20,
        margin: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    sky: {
        height: '35%',
        backgroundColor: '#87CEEB',
        position: 'relative',
    },
    cloud1: {
        position: 'absolute',
        top: 20,
        left: 30,
        width: 60,
        height: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    cloud2: {
        position: 'absolute',
        top: 40,
        right: 80,
        width: 40,
        height: 15,
        backgroundColor: '#fff',
        borderRadius: 15,
    },
    cloud3: {
        position: 'absolute',
        top: 15,
        right: 50,
        width: 50,
        height: 18,
        backgroundColor: '#fff',
        borderRadius: 18,
    },
    sun: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
        backgroundColor: '#FFD700',
        borderRadius: 20,
    },
    sea: {
        height: '65%',
        backgroundColor: '#1E40AF',
        position: 'relative',
    },
    wave1: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: '#3B82F6',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    wave2: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#60A5FA',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    sailboat: {
        position: 'absolute',
        bottom: 30,
        width: 80,
        height: 60,
    },
    sail: {
        position: 'absolute',
        top: 0,
        left: 20,
        width: 0,
        height: 0,
        borderLeftWidth: 0,
        borderRightWidth: 25,
        borderBottomWidth: 40,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#DC2626',
    },
    sailStripe: {
        position: 'absolute',
        width: 25,
        height: 8,
        top: 32,
        left: 0,
    },
    hull: {
        position: 'absolute',
        bottom: 0,
        left: 10,
        width: 60,
        height: 20,
        backgroundColor: '#8B4513',
        borderRadius: 10,
    },
    hullShadow: {
        position: 'absolute',
        bottom: -3,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#654321',
        borderRadius: 3,
    },
    finishLine: {
        position: 'absolute',
        right: 20,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: '#FFD700',
    },
    flag: {
        position: 'absolute',
        right: 4,
        top: '50%',
        width: 20,
        height: 15,
        backgroundColor: '#000',
    },
    flagStripe1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3.75,
        backgroundColor: '#000',
    },
    flagStripe2: {
        position: 'absolute',
        top: 3.75,
        left: 0,
        right: 0,
        height: 3.75,
        backgroundColor: '#fff',
    },
    flagStripe3: {
        position: 'absolute',
        top: 7.5,
        left: 0,
        right: 0,
        height: 3.75,
        backgroundColor: '#000',
    },
    flagStripe4: {
        position: 'absolute',
        top: 11.25,
        left: 0,
        right: 0,
        height: 3.75,
        backgroundColor: '#fff',
    },
    gameStatus: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    statusText: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
    },
    winText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#059669',
        textAlign: 'center',
        marginBottom: 8,
    },
    finalScore: {
        fontSize: 16,
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 16,
    },
    resetButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    blowButton: {
        backgroundColor: '#1E40AF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 25,
        gap: 8,
    },
    blowButtonActive: {
        backgroundColor: '#1D4ED8',
        transform: [{ scale: 0.95 }],
    },
    blowButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    // Blow Intensity Indicator Styles
    intensityContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    intensityLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    intensityBar: {
        width: '80%',
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    intensityFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    intensityValue: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    },
    // Sensitivity Controls Styles
    sensitivityContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sensitivityLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    sensitivityButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    sensitivityButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sensitivityButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    sensitivityButtonText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    sensitivityButtonTextActive: {
        color: '#fff',
    },
});
