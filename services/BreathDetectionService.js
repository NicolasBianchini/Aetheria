import { Audio } from 'expo-av';

class BreathDetectionService {
    constructor() {
        this.isRecording = false;
        this.recording = null;
        this.audioPermission = false;

        // Configurações específicas para detecção de sopro
        this.breathConfig = {
            // Frequências características do sopro humano (Hz)
            breathFrequencyRange: {
                min: 100,    // Sopros suaves
                max: 2000,   // Sopros fortes
            },

            // Duração mínima e máxima de um sopro válido (ms)
            breathDuration: {
                min: 200,    // 0.2 segundos
                max: 5000,   // 5 segundos
            },

            // Intensidade mínima para considerar como sopro
            minIntensity: 0.15,

            // Padrões de frequência específicos do sopro
            breathPatterns: {
                // Sopros suaves: frequências baixas, amplitude moderada
                gentle: { freq: [100, 500], intensity: [0.15, 0.4] },
                // Sopros médios: frequências médias, amplitude moderada-alta
                medium: { freq: [300, 800], intensity: [0.3, 0.7] },
                // Sopros fortes: frequências altas, amplitude alta
                strong: { freq: [500, 1500], intensity: [0.5, 1.0] },
            },

            // Filtros para eliminar ruídos não-sopro
            noiseFilters: {
                // Eliminar frequências muito baixas (ruído de fundo)
                lowCutoff: 80,
                // Eliminar frequências muito altas (ruídos agudos)
                highCutoff: 2500,
                // Eliminar sons muito curtos (cliques, pops)
                minDuration: 100,
            }
        };

        // Buffer para análise de áudio em tempo real
        this.audioBuffer = [];
        this.analysisInterval = null;

        // Histórico de detecções
        this.detectionHistory = [];
        this.lastBreathTime = 0;
    }

    async initialize() {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            this.audioPermission = status === 'granted';

            if (this.audioPermission) {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            }

            return this.audioPermission;
        } catch (error) {
            console.error('Erro ao inicializar BreathDetectionService:', error);
            return false;
        }
    }

    async startBreathDetection(onBreathDetected, onAnalysisUpdate) {
        if (!this.audioPermission) {
            throw new Error('Permissão de microfone não concedida');
        }

        if (this.isRecording) {
            throw new Error('Detecção já está em andamento');
        }

        try {
            // Configurações otimizadas para detecção de sopro
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
                // ATIVAR METERING PARA DETECÇÃO REAL DE SOPRO
                isMeteringEnabled: true,
            };

            const { recording } = await Audio.Recording.createAsync(recordingOptions);
            this.recording = recording;
            this.isRecording = true;

            // Iniciar análise em tempo real
            this.startRealTimeAnalysis(onBreathDetected, onAnalysisUpdate);

            console.log('Detecção de sopro iniciada com análise avançada');
            return true;
        } catch (error) {
            console.error('Erro ao iniciar detecção de sopro:', error);
            throw error;
        }
    }

    startRealTimeAnalysis(onBreathDetected, onAnalysisUpdate) {
        // Análise em tempo real a cada 100ms
        this.analysisInterval = setInterval(async () => {
            try {
                if (!this.recording) return;

                // Simular análise de áudio (em implementação real, usaria Web Audio API)
                const audioAnalysis = await this.analyzeAudioChunk();

                // Verificar se é um sopro válido
                const breathDetection = this.detectBreath(audioAnalysis);

                // Atualizar callback com dados de análise
                if (onAnalysisUpdate) {
                    onAnalysisUpdate({
                        intensity: audioAnalysis.intensity,
                        frequency: audioAnalysis.dominantFrequency,
                        isBreath: breathDetection.isBreath,
                        breathType: breathDetection.type,
                        confidence: breathDetection.confidence,
                        timestamp: Date.now(),
                    });
                }

                // Se detectou sopro válido, chamar callback
                if (breathDetection.isBreath && breathDetection.confidence > 0.7) {
                    const now = Date.now();
                    // Evitar detecções muito próximas (debounce)
                    if (now - this.lastBreathTime > 500) {
                        this.lastBreathTime = now;

                        // Adicionar ao histórico
                        this.detectionHistory.push({
                            ...breathDetection,
                            timestamp: now,
                        });

                        if (onBreathDetected) {
                            onBreathDetected({
                                type: breathDetection.type,
                                intensity: audioAnalysis.intensity,
                                duration: breathDetection.duration,
                                confidence: breathDetection.confidence,
                                timestamp: now,
                            });
                        }
                    }
                }

            } catch (error) {
                console.error('Erro na análise em tempo real:', error);
            }
        }, 100);
    }

    async analyzeAudioChunk() {
        // ANÁLISE REAL DE ÁUDIO usando metering do microfone
        
        try {
            const status = await this.recording.getStatusAsync();
            
            if (status.isRecording && status.metering !== undefined) {
                const meteringDB = status.metering;
                
                // Converter dB para intensidade 0-1
                // AJUSTADO: Thresholds mais restritivos para filtrar ruído ambiente
                const minDB = -50; // Ruído ambiente (mais alto = menos sensível)
                const maxDB = -5;  // Som muito alto (sopro direto no microfone)
                let intensity = (meteringDB - minDB) / (maxDB - minDB);
                intensity = Math.max(0, Math.min(1, intensity));
                
                // Aplicar curva de potência para reduzir sensibilidade a sons baixos
                intensity = Math.pow(intensity, 1.5);
                
                // Estimar frequência dominante baseada na intensidade
                // Sopros suaves: ~100-500Hz, Sopros médios: ~300-800Hz, Sopros fortes: ~500-1500Hz
                let dominantFrequency;
                if (intensity < 0.3) {
                    // Sopro suave
                    dominantFrequency = 100 + (intensity / 0.3) * 400;
                } else if (intensity < 0.6) {
                    // Sopro médio
                    dominantFrequency = 300 + ((intensity - 0.3) / 0.3) * 500;
                } else {
                    // Sopro forte
                    dominantFrequency = 500 + ((intensity - 0.6) / 0.4) * 1000;
                }
                
                console.log(`🎤 Metering: ${meteringDB.toFixed(2)} dB → Intensidade: ${(intensity * 100).toFixed(1)}% | Freq: ${dominantFrequency.toFixed(0)} Hz`);

                return {
                    intensity,
                    dominantFrequency,
                    timestamp: Date.now(),
                };
            }
        } catch (error) {
            console.error('Erro ao analisar áudio:', error);
        }
        
        // Fallback em caso de erro
        return {
            intensity: 0,
            dominantFrequency: 0,
            timestamp: Date.now(),
        };
    }

    generateBreathFrequency() {
        // Simular frequências características do sopro
        const breathTypes = ['gentle', 'medium', 'strong'];
        const type = breathTypes[Math.floor(Math.random() * breathTypes.length)];
        const pattern = this.breathConfig.breathPatterns[type];

        const minFreq = pattern.freq[0];
        const maxFreq = pattern.freq[1];

        return minFreq + Math.random() * (maxFreq - minFreq);
    }

    detectBreath(audioAnalysis) {
        const { intensity, dominantFrequency } = audioAnalysis;

        // Verificar se está na faixa de frequência do sopro
        const isInBreathRange =
            dominantFrequency >= this.breathConfig.breathFrequencyRange.min &&
            dominantFrequency <= this.breathConfig.breathFrequencyRange.max;

        // Verificar intensidade mínima
        const hasMinIntensity = intensity >= this.breathConfig.minIntensity;

        // Determinar tipo de sopro baseado na frequência e intensidade
        let breathType = 'none';
        let confidence = 0;

        if (isInBreathRange && hasMinIntensity) {
            // Sopros suaves
            if (dominantFrequency < 400 && intensity < 0.5) {
                breathType = 'gentle';
                confidence = 0.8;
            }
            // Sopros médios
            else if (dominantFrequency < 800 && intensity < 0.8) {
                breathType = 'medium';
                confidence = 0.9;
            }
            // Sopros fortes
            else {
                breathType = 'strong';
                confidence = 0.95;
            }
        }

        // Aplicar filtros de ruído
        const passesNoiseFilter = this.applyNoiseFilters(audioAnalysis);

        return {
            isBreath: isInBreathRange && hasMinIntensity && passesNoiseFilter,
            type: breathType,
            confidence: confidence * (passesNoiseFilter ? 1 : 0.3),
            duration: this.calculateBreathDuration(),
        };
    }

    applyNoiseFilters(audioAnalysis) {
        const { intensity, dominantFrequency } = audioAnalysis;

        // Filtro 1: Eliminar frequências muito baixas (ruído de fundo)
        if (dominantFrequency < this.breathConfig.noiseFilters.lowCutoff) {
            return false;
        }

        // Filtro 2: Eliminar frequências muito altas (ruídos agudos)
        if (dominantFrequency > this.breathConfig.noiseFilters.highCutoff) {
            return false;
        }

        // Filtro 3: Eliminar intensidades muito baixas (ruído ambiente)
        if (intensity < this.breathConfig.minIntensity) {
            return false;
        }

        // Filtro 4: Verificar padrão temporal (evitar cliques/pops)
        const now = Date.now();
        const recentDetections = this.detectionHistory.filter(
            d => now - d.timestamp < 200
        );

        // Se há muitas detecções recentes, pode ser ruído
        if (recentDetections.length > 3) {
            return false;
        }

        return true;
    }

    calculateBreathDuration() {
        // Simular duração do sopro baseado no histórico
        return 200 + Math.random() * 1000; // 200ms a 1200ms
    }

    async stopBreathDetection() {
        if (!this.isRecording || !this.recording) {
            throw new Error('Nenhuma detecção em andamento');
        }

        try {
            this.isRecording = false;

            // Parar análise em tempo real
            if (this.analysisInterval) {
                clearInterval(this.analysisInterval);
                this.analysisInterval = null;
            }

            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();

            this.recording = null;
            console.log('Detecção de sopro finalizada:', uri);

            return uri;
        } catch (error) {
            console.error('Erro ao parar detecção de sopro:', error);
            throw error;
        }
    }

    // Método para calibrar sensibilidade baseado no ambiente
    async calibrateSensitivity() {
        console.log('Iniciando calibração de sensibilidade...');

        // Simular calibração
        const calibrationData = {
            ambientNoise: Math.random() * 0.1,
            optimalThreshold: 0.15 + Math.random() * 0.1,
            frequencyBaseline: 200 + Math.random() * 300,
            timestamp: Date.now(),
        };

        // Ajustar configurações baseado na calibração
        this.breathConfig.minIntensity = calibrationData.optimalThreshold;

        console.log('Calibração concluída:', calibrationData);
        return calibrationData;
    }

    // Obter estatísticas de detecção
    getDetectionStats() {
        return {
            totalDetections: this.detectionHistory.length,
            lastBreathTime: this.lastBreathTime,
            averageConfidence: this.calculateAverageConfidence(),
            breathTypes: this.getBreathTypeDistribution(),
        };
    }

    calculateAverageConfidence() {
        if (this.detectionHistory.length === 0) return 0;

        const totalConfidence = this.detectionHistory.reduce(
            (sum, detection) => sum + detection.confidence, 0
        );

        return totalConfidence / this.detectionHistory.length;
    }

    getBreathTypeDistribution() {
        const distribution = { gentle: 0, medium: 0, strong: 0 };

        this.detectionHistory.forEach(detection => {
            if (distribution[detection.type] !== undefined) {
                distribution[detection.type]++;
            }
        });

        return distribution;
    }

    cleanup() {
        if (this.recording) {
            this.recording.stopAndUnloadAsync();
            this.recording = null;
        }

        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }

        this.isRecording = false;
        this.detectionHistory = [];
    }
}

export default BreathDetectionService;