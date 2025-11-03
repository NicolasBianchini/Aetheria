// Configuração da API do backend
// IMPORTANTE: No React Native, localhost não funciona em emuladores/dispositivos
// - Android Emulator: use 10.0.2.2 (IP especial que aponta para o host)
// - iOS Simulator: localhost funciona
// - Dispositivo físico: use o IP da máquina na rede local
// Configure via variável de ambiente: API_BASE_URL=http://10.0.2.2:5001

// Detectar automaticamente o ambiente
let Platform;
try {
    Platform = require('react-native').Platform;
} catch (e) {
    // Não é React Native, usar fallback
    Platform = null;
}

const getApiBaseUrl = () => {
    // Se configurado via env, usar (sempre priorizar env)
    if (process.env.API_BASE_URL) {
        console.log('🌐 Usando API_BASE_URL do env:', process.env.API_BASE_URL);
        return process.env.API_BASE_URL;
    }
    
    // Detectar plataforma (React Native)
    if (Platform) {
        // IMPORTANTE: Expo Go em dispositivo físico não consegue acessar localhost
        // Precisa usar o IP da máquina na rede local
        // Para desenvolvimento, use o IP da máquina (ex: 172.20.10.7:5001)
        
        // Verificar se é um dispositivo físico (via Constants)
        let isPhysicalDevice = false;
        try {
            const Constants = require('expo-constants');
            // Se não for um emulador/simulador, é dispositivo físico
            isPhysicalDevice = !Constants.isDevice || Constants.executionEnvironment !== 'standalone';
        } catch (e) {
            // Se não conseguir detectar, assume que pode ser dispositivo físico
            isPhysicalDevice = true;
        }
        
        if (Platform.OS === 'android') {
            // Android Emulator: 10.0.2.2 aponta para o host
            // Android dispositivo físico: precisa do IP da máquina
            const url = isPhysicalDevice ? 'http://172.20.10.7:5001' : 'http://10.0.2.2:5001';
            console.log('🌐 Android detectado, usando:', url, isPhysicalDevice ? '(dispositivo físico)' : '(emulador)');
            return url;
        } else if (Platform.OS === 'ios') {
            // iOS Simulator: localhost funciona
            // iOS dispositivo físico: precisa do IP da máquina
            const url = isPhysicalDevice ? 'http://172.20.10.7:5001' : 'http://localhost:5001';
            console.log('🌐 iOS detectado, usando:', url, isPhysicalDevice ? '(dispositivo físico)' : '(simulador)');
            return url;
        }
    }
    
    // Fallback: para dispositivo físico, usar IP da máquina
    // IMPORTANTE: Atualize o IP abaixo com o IP da sua máquina na rede local
    const url = 'http://172.20.10.7:5001';
    console.log('🌐 Fallback, usando IP da máquina:', url);
    return url;
};

const API_BASE_URL = getApiBaseUrl();

// Log para debug (remover em produção)
console.log('🌐 API Base URL configurada:', API_BASE_URL);

const API_CONFIG = {
    // URL base do backend Python
    BASE_URL: API_BASE_URL,

    // Endpoints da API
    ENDPOINTS: {
        HEALTH: '/api/health',
        CREATE_GAME: '/api/games/create',
        START_GAME: '/api/games/{gameId}/start',
        END_GAME: '/api/games/{gameId}/end',
        PROCESS_AUDIO: '/api/games/{gameId}/audio',
        GAME_STATUS: '/api/games/{gameId}/status',
        ALL_GAMES: '/api/games',
        CALIBRATE_AUDIO: '/api/audio/calibrate',
        STATS: '/api/stats',
    },

    // Configurações de timeout
    TIMEOUT: 10000, // 10 segundos

    // Headers padrão
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
    },
};

// Função para construir URL completa
export const buildApiUrl = (endpoint, params = {}) => {
    let url = API_CONFIG.BASE_URL + endpoint;

    // Substituir parâmetros na URL
    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key]);
    });

    return url;
};

// Função para fazer requisições com tratamento de erro
export const apiRequest = async (url, options = {}) => {
    const defaultOptions = {
        headers: API_CONFIG.DEFAULT_HEADERS,
        timeout: API_CONFIG.TIMEOUT,
    };

    const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            // Tentar obter mensagem de erro do backend se disponível
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
                // Adicionar código HTTP ao erro para facilitar detecção
                const enhancedError = new Error(errorMessage);
                enhancedError.status = response.status;
                enhancedError.response = errorData;
                throw enhancedError;
            } catch (jsonError) {
                // Se não conseguir parsear JSON, usar mensagem padrão
                const enhancedError = new Error(errorMessage);
                enhancedError.status = response.status;
                throw enhancedError;
            }
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição da API:', error);
        throw error;
    }
};

export default API_CONFIG;
