import { Audio } from 'expo-av';
import { buildApiUrl, apiRequest } from '../config/api';

class AudioService {
    constructor() {
        this.recording = null;
        this.isRecording = false;
        this.audioPermission = false;
    }

    async initialize() {
        try {
            // Solicitar permissão de áudio usando expo-av
            const { status } = await Audio.requestPermissionsAsync();
            this.audioPermission = status === 'granted';

            if (this.audioPermission) {
                // Configurar modo de áudio para gravação
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    staysActiveInBackground: false,
                    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
                });
            }

            return this.audioPermission;
        } catch (error) {
            console.error('Erro ao inicializar AudioService:', error);
            return false;
        }
    }

    async startRecording() {
        if (!this.audioPermission) {
            throw new Error('Permissão de microfone não concedida');
        }

        if (this.isRecording) {
            throw new Error('Gravação já está em andamento');
        }

        try {
            // Usar configurações padrão otimizadas
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

            const { recording } = await Audio.Recording.createAsync(recordingOptions);
            this.recording = recording;
            this.isRecording = true;

            console.log('Gravação iniciada com configurações otimizadas');
            return true;
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            throw error;
        }
    }

    async stopRecording() {
        if (!this.isRecording || !this.recording) {
            throw new Error('Nenhuma gravação em andamento');
        }

        try {
            this.isRecording = false;
            await this.recording.stopAndUnloadAsync();

            const uri = this.recording.getURI();
            console.log('Gravação finalizada:', uri);

            this.recording = null;
            return uri;
        } catch (error) {
            console.error('Erro ao parar gravação:', error);
            throw error;
        }
    }

    async processAudioForBackend(audioUri) {
        try {
            // Converter áudio para formato otimizado
            const audioData = await this.convertAudioToOptimizedFormat(audioUri);

            // Extrair apenas informações essenciais
            const audioInfo = await this.extractAudioInfo(audioData);

            return {
                audioData,
                audioInfo,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error('Erro ao processar áudio:', error);
            throw error;
        }
    }

    async convertAudioToOptimizedFormat(audioUri) {
        try {
            // Ler o arquivo de áudio
            const response = await fetch(audioUri);
            const blob = await response.blob();

            // Converter para ArrayBuffer
            const arrayBuffer = await blob.arrayBuffer();

            // Converter para base64
            const base64Audio = await this.arrayBufferToBase64(arrayBuffer);

            return base64Audio;
        } catch (error) {
            console.error('Erro ao converter áudio:', error);
            throw error;
        }
    }

    async extractAudioInfo(audioData) {
        try {
            // Informações básicas do áudio
            const audioInfo = {
                duration: 0, // Será calculado pelo backend
                sampleRate: 16000,
                channels: 1,
                format: 'm4a',
                size: audioData.length,
                timestamp: new Date().toISOString(),
            };

            return audioInfo;
        } catch (error) {
            console.error('Erro ao extrair informações do áudio:', error);
            return {
                duration: 0,
                sampleRate: 16000,
                channels: 1,
                format: 'm4a',
                size: audioData.length,
                timestamp: new Date().toISOString(),
            };
        }
    }

    arrayBufferToBase64(buffer) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(new Blob([buffer]));
        });
    }

    async sendToBackend(audioData, audioInfo, gameType = 'boat') {
        try {
            // Criar jogo no backend
            const createGameUrl = buildApiUrl('/api/games/create');
            const gameData = await apiRequest(createGameUrl, {
                method: 'POST',
                body: JSON.stringify({
                    game_type: gameType,
                    player_name: 'Audio Test',
                    audio_info: audioInfo,
                }),
            });

            const gameId = gameData.game.game_id;

            // Ativar o jogo antes de enviar áudio
            const startGameUrl = buildApiUrl('/api/games/{gameId}/start', { gameId });
            await apiRequest(startGameUrl, {
                method: 'POST',
            });

            // Enviar áudio processado
            const audioUrl = buildApiUrl('/api/games/{gameId}/audio', { gameId });
            const result = await apiRequest(audioUrl, {
                method: 'POST',
                body: JSON.stringify({
                    audio_data: audioData,
                    audio_info: audioInfo,
                }),
            });

            return {
                success: true,
                gameId,
                result,
                audioInfo,
            };
        } catch (error) {
            console.error('Erro ao enviar para backend:', error);
            throw error;
        }
    }

    // Limpar recursos
    cleanup() {
        if (this.recording) {
            this.recording.stopAndUnloadAsync();
            this.recording = null;
        }
        this.isRecording = false;
    }
}

export default AudioService;