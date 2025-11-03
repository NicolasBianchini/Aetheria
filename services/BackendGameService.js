/**
 * Serviço para comunicação com backend Python
 * Todos os jogos são controlados pelo backend Python
 */
import { buildApiUrl, apiRequest } from '../config/api';

class BackendGameService {
    constructor() {
        this.currentGameId = null;
        this.gameType = null;
        this.isGameActive = false;
        this.playerName = 'Jogador'; // Guardar nome do jogador para recriar se necessário
    }

    /**
     * Cria um novo jogo no backend
     * @param {string} gameType - 'boat' ou 'balloon'
     * @param {string} playerName - Nome do jogador
     * @returns {Promise<Object>} Informações do jogo criado
     */
    async createGame(gameType, playerName = 'Jogador') {
        try {
            const url = buildApiUrl('/api/games/create');
            console.log('🔍 createGame - URL:', url);
            console.log('🔍 createGame - gameType:', gameType, 'playerName:', playerName);
            
            const response = await apiRequest(url, {
                method: 'POST',
                body: JSON.stringify({
                    game_type: gameType,
                    player_name: playerName,
                }),
            });

            if (response.success) {
                this.currentGameId = response.game.game_id;
                this.gameType = gameType;
                this.playerName = playerName; // Guardar nome do jogador para recriar se necessário
                this.isGameActive = false; // Jogo criado mas ainda não iniciado
                console.log('✅ Jogo criado no backend:', this.currentGameId);
                return response.game;
            } else {
                throw new Error(response.message || 'Erro ao criar jogo');
            }
        } catch (error) {
            console.error('❌ Erro ao criar jogo no backend:', error);
            throw error;
        }
    }

    /**
     * Inicia um jogo no backend
     * @param {string} gameId - ID do jogo
     * @returns {Promise<Object>} Estado inicial do jogo
     */
    async startGame(gameId = this.currentGameId) {
        try {
            if (!gameId) {
                throw new Error('Game ID não definido');
            }

            const url = buildApiUrl('/api/games/{gameId}/start', { gameId });
            console.log('🔍 startGame - URL:', url);
            console.log('🔍 startGame - gameId:', gameId);
            
            const response = await apiRequest(url, {
                method: 'POST',
            });

            if (response.success) {
                this.isGameActive = true;
                console.log('✅ Jogo iniciado no backend');
                return response.game;
            } else {
                throw new Error(response.message || 'Erro ao iniciar jogo');
            }
        } catch (error) {
            console.error('❌ Erro ao iniciar jogo no backend:', error);
            throw error;
        }
    }

    /**
     * Processa áudio e retorna estado do jogo do backend Python
     * @param {number} audioIntensity - Intensidade do áudio (0-1)
     * @param {number} audioMeteringDB - Nível de metering em dB
     * @returns {Promise<Object>} Estado atual do jogo
     */
    async processAudio(audioIntensity = null, audioMeteringDB = null) {
        try {
            // Se não tem gameId, tentar recriar
            if (!this.currentGameId) {
                console.warn('⚠️ Jogo não existe, criando novo jogo...');
                const gameInfo = await this.createGame(this.gameType || 'boat', this.playerName || 'Jogador');
                await this.startGame(gameInfo.game_id);
            }
            
            // Se jogo existe mas não está ativo, tentar iniciar
            if (this.currentGameId && !this.isGameActive) {
                console.warn('⚠️ Jogo existe mas não está ativo, iniciando...');
                try {
                    await this.startGame(this.currentGameId);
                } catch (startError) {
                    console.warn('⚠️ Erro ao iniciar jogo existente, criando novo...', startError);
                    // Se falhar ao iniciar, criar novo jogo
                    const gameInfo = await this.createGame(this.gameType || 'boat', this.playerName || 'Jogador');
                    await this.startGame(gameInfo.game_id);
                }
            }
            
            if (!this.currentGameId || !this.isGameActive) {
                throw new Error('Jogo não está ativo após tentativas de inicialização');
            }

            const url = buildApiUrl('/api/games/{gameId}/audio', { gameId: this.currentGameId });
            console.log('🔍 processAudio - URL:', url);
            console.log('🔍 processAudio - gameId:', this.currentGameId);
            console.log('🔍 processAudio - isGameActive:', this.isGameActive);
            
            const response = await apiRequest(url, {
                method: 'POST',
                body: JSON.stringify({
                    audio_intensity: audioIntensity,
                    audio_metering_db: audioMeteringDB,
                }),
            });

            if (response.success) {
                return response.game_state;
            } else {
                throw new Error(response.message || 'Erro ao processar áudio');
            }
        } catch (error) {
            // Se o jogo não existe (404), pode ter sido perdido (backend reiniciado)
            // Tentar recriar o jogo automaticamente
            const errorMessage = String(error.message || error);
            const errorStatus = error.status || (error.response && error.response.status);
            const is404Error = errorStatus === 404 || 
                             errorMessage.includes('404') || 
                             errorMessage.includes('não encontrado') || 
                             errorMessage.includes('Jogo não encontrado') ||
                             errorMessage.includes('HTTP 404');
            
            if (is404Error && !this._retryInProgress) {
                console.warn('⚠️ Jogo não encontrado (404), tentando recriar...');
                try {
                    // Recriar jogo com o mesmo tipo e nome do jogador
                    const gameInfo = await this.createGame(this.gameType || 'boat', this.playerName || 'Jogador');
                    await this.startGame(gameInfo.game_id);
                    console.log('✅ Jogo recriado automaticamente:', this.currentGameId);
                    
                    // Tentar novamente com o novo jogo (apenas uma vez para evitar loop infinito)
                    if (!this._retryInProgress) {
                        this._retryInProgress = true;
                        try {
                            const result = await this.processAudio(audioIntensity, audioMeteringDB);
                            this._retryInProgress = false;
                            return result;
                        } catch (retryError) {
                            this._retryInProgress = false;
                            throw retryError;
                        }
                    }
                } catch (retryError) {
                    console.error('❌ Erro ao recriar jogo:', retryError);
                    throw new Error('Jogo não encontrado e não foi possível recriar. Por favor, reinicie o jogo.');
                }
            }
            console.error('Erro ao processar áudio no backend:', error);
            throw error;
        }
    }

    /**
     * Obtém status atual do jogo
     * @returns {Promise<Object>} Status do jogo
     */
    async getGameStatus() {
        try {
            if (!this.currentGameId) {
                throw new Error('Game ID não definido');
            }

            const url = buildApiUrl('/api/games/{gameId}/status', { gameId: this.currentGameId });
            const response = await apiRequest(url, {
                method: 'GET',
            });

            if (response.success) {
                return response.status;
            } else {
                throw new Error(response.message || 'Erro ao obter status');
            }
        } catch (error) {
            console.error('Erro ao obter status do jogo:', error);
            throw error;
        }
    }

    /**
     * Finaliza um jogo
     * @returns {Promise<Object>} Resultados finais do jogo
     */
    async endGame() {
        try {
            if (!this.currentGameId) {
                console.warn('⚠️ endGame chamado mas currentGameId não está definido');
                throw new Error('Game ID não definido');
            }

            const url = buildApiUrl('/api/games/{gameId}/end', { gameId: this.currentGameId });
            console.log('🔍 endGame - URL:', url);
            console.log('🔍 endGame - gameId:', this.currentGameId);
            
            const response = await apiRequest(url, {
                method: 'POST',
            });

            if (response.success) {
                this.isGameActive = false;
                const finalScore = response.game.score || 0;
                console.log('✅ Jogo finalizado no backend. Score:', finalScore);
                // NÃO limpar currentGameId aqui, apenas isGameActive
                // Isso permite que o jogo seja finalizado corretamente
                return response.game;
            } else {
                throw new Error(response.message || 'Erro ao finalizar jogo');
            }
        } catch (error) {
            console.error('❌ Erro ao finalizar jogo no backend:', error);
            throw error;
        }
    }

    /**
     * Limpa estado do serviço
     */
    reset() {
        console.log('🔄 Resetando BackendGameService - gameId:', this.currentGameId);
        this.currentGameId = null;
        this.gameType = null;
        this.isGameActive = false;
        this.playerName = 'Jogador';
    }
}

export default new BackendGameService();

