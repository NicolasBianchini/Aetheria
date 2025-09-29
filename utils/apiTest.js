import { buildApiUrl, apiRequest } from '../config/api';

// Função para testar todas as rotas da API
export const testAllApiRoutes = async () => {
    const results = {};

    try {
        // Teste 1: Health Check
        console.log('🔍 Testando Health Check...');
        const healthUrl = buildApiUrl('/api/health');
        results.health = await apiRequest(healthUrl);
        console.log('✅ Health Check OK:', results.health);

        // Teste 2: Criar Jogo
        console.log('🔍 Testando criação de jogo...');
        const createGameUrl = buildApiUrl('/api/games/create');
        results.createGame = await apiRequest(createGameUrl, {
            method: 'POST',
            body: JSON.stringify({
                game_type: 'boat',
                player_name: 'API Test',
                audio_info: {
                    sampleRate: 16000,
                    channels: 1,
                    format: 'm4a',
                    size: 12345,
                },
            }),
        });
        console.log('✅ Criação de jogo OK:', results.createGame);

        const gameId = results.createGame.game.game_id;

        // Teste 3: Status do Jogo
        console.log('🔍 Testando status do jogo...');
        const statusUrl = buildApiUrl('/api/games/{gameId}/status', { gameId });
        results.gameStatus = await apiRequest(statusUrl);
        console.log('✅ Status do jogo OK:', results.gameStatus);

        // Teste 4: Listar Jogos
        console.log('🔍 Testando listagem de jogos...');
        const allGamesUrl = buildApiUrl('/api/games');
        results.allGames = await apiRequest(allGamesUrl);
        console.log('✅ Listagem de jogos OK:', results.allGames);

        // Teste 5: Estatísticas
        console.log('🔍 Testando estatísticas...');
        const statsUrl = buildApiUrl('/api/stats');
        results.stats = await apiRequest(statsUrl);
        console.log('✅ Estatísticas OK:', results.stats);

        console.log('🎉 Todos os testes passaram!');
        return { success: true, results };

    } catch (error) {
        console.error('❌ Erro no teste da API:', error);
        return { success: false, error: error.message, results };
    }
};

// Função para testar apenas a criação de jogo
export const testCreateGame = async () => {
    try {
        console.log('🔍 Testando criação de jogo...');
        const createGameUrl = buildApiUrl('/api/games/create');
        const result = await apiRequest(createGameUrl, {
            method: 'POST',
            body: JSON.stringify({
                game_type: 'boat',
                player_name: 'Teste Simples',
                audio_info: {
                    sampleRate: 16000,
                    channels: 1,
                    format: 'm4a',
                    size: 12345,
                },
            }),
        });
        console.log('✅ Criação de jogo OK:', result);
        return { success: true, result };
    } catch (error) {
        console.error('❌ Erro na criação de jogo:', error);
        return { success: false, error: error.message };
    }
};

// Função para testar processamento de áudio
export const testAudioProcessing = async (gameId, audioData, audioInfo) => {
    try {
        console.log('🔍 Testando processamento de áudio...');

        // Ativar o jogo primeiro
        const startGameUrl = buildApiUrl('/api/games/{gameId}/start', { gameId });
        await apiRequest(startGameUrl, {
            method: 'POST',
        });
        console.log('✅ Jogo ativado');

        const audioUrl = buildApiUrl('/api/games/{gameId}/audio', { gameId });
        const result = await apiRequest(audioUrl, {
            method: 'POST',
            body: JSON.stringify({
                audio_data: audioData,
                audio_info: audioInfo,
            }),
        });
        console.log('✅ Processamento de áudio OK:', result);
        return { success: true, result };
    } catch (error) {
        console.error('❌ Erro no processamento de áudio:', error);
        return { success: false, error: error.message };
    }
};
