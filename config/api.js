// Configuração da API do backend
const API_CONFIG = {
    // URL base do backend Python
    BASE_URL: 'http://10.125.136.89:3000',

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
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição da API:', error);
        throw error;
    }
};

export default API_CONFIG;
