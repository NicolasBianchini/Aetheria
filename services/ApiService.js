import FirestoreService from './FirestoreService';
import AuthService from './AuthService';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.token = null;
        this.userId = null;
        this.useFirebase = true; // Flag para alternar entre Firebase e API local
    }

    setAuth(token, userId) {
        this.token = token;
        this.userId = userId;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.userId) {
            headers['X-User-ID'] = this.userId;
        }
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Autenticação
    async login(email, password) {
        if (this.useFirebase) {
            try {
                const result = await AuthService.login(email, password);
                
                if (result.success) {
                    this.setAuth(result.user.accessToken || 'firebase_token', result.user.uid);
                }
                
                return result;
            } catch (error) {
                console.error('Erro no login Firebase:', error);
                // Fallback para API local
                return this.request('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });
            }
        } else {
            const data = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            
            if (data.success) {
                this.setAuth(data.token, data.user.id);
            }
            
            return data;
        }
    }

    async register(email, password, userData = {}) {
        if (this.useFirebase) {
            try {
                const result = await AuthService.register(email, password, userData);
                
                if (result.success) {
                    this.setAuth(result.user.accessToken || 'firebase_token', result.user.uid);
                }
                
                return result;
            } catch (error) {
                console.error('Erro no registro Firebase:', error);
                return {
                    success: false,
                    message: error.message
                };
            }
        } else {
            return {
                success: false,
                message: 'Registro não disponível na API local'
            };
        }
    }

    async logout() {
        if (this.useFirebase) {
            try {
                const result = await AuthService.logout();
                this.setAuth(null, null);
                return result;
            } catch (error) {
                console.error('Erro no logout Firebase:', error);
                this.setAuth(null, null);
                return { success: true, message: 'Logout realizado' };
            }
        } else {
            const data = await this.request('/auth/logout', {
                method: 'POST',
            });
            this.setAuth(null, null);
            return data;
        }
    }

    // Perfil
    async getProfile() {
        if (this.useFirebase && this.userId) {
            try {
                const user = await AuthService.getUserData(this.userId);
                return { success: true, user };
            } catch (error) {
                console.error('Erro ao buscar perfil Firebase:', error);
                return this.request('/user/profile');
            }
        } else {
            return this.request('/user/profile');
        }
    }

    async updateProfile(profileData) {
        if (this.useFirebase && this.userId) {
            try {
                const result = await AuthService.updateUserProfile(this.userId, profileData);
                return result;
            } catch (error) {
                console.error('Erro ao atualizar perfil Firebase:', error);
                return this.request('/user/profile', {
                    method: 'PUT',
                    body: JSON.stringify(profileData),
                });
            }
        } else {
            return this.request('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData),
            });
        }
    }

    // Jogos
    async startGameSession(gameType) {
        if (this.useFirebase && this.userId) {
            try {
                const sessionData = {
                    userId: this.userId,
                    gameType: gameType,
                    score: 0,
                    duration: 0,
                    completed: false
                };
                const session = await FirestoreService.createSession(sessionData);
                return { success: true, session };
            } catch (error) {
                console.error('Erro ao iniciar sessão Firebase:', error);
                return this.request('/games/session', {
                    method: 'POST',
                    body: JSON.stringify({ game_type: gameType }),
                });
            }
        } else {
            return this.request('/games/session', {
                method: 'POST',
                body: JSON.stringify({ game_type: gameType }),
            });
        }
    }

    async endGameSession(sessionId, score, duration, completed) {
        if (this.useFirebase && this.userId) {
            try {
                const sessionData = {
                    score: score,
                    duration: duration,
                    completed: completed
                };
                await FirestoreService.updateSession(sessionId, sessionData);
                
                // Criar registro de pontuação
                await FirestoreService.createScore({
                    userId: this.userId,
                    sessionId: sessionId,
                    score: score,
                    duration: duration,
                    completed: completed
                });

                return { success: true, message: 'Sessão finalizada com sucesso' };
            } catch (error) {
                console.error('Erro ao finalizar sessão Firebase:', error);
                return this.request(`/games/session/${sessionId}/end`, {
                    method: 'POST',
                    body: JSON.stringify({ score, duration, completed }),
                });
            }
        } else {
            return this.request(`/games/session/${sessionId}/end`, {
                method: 'POST',
                body: JSON.stringify({ score, duration, completed }),
            });
        }
    }

    // Estatísticas
    async getRecentStats() {
        if (this.useFirebase && this.userId) {
            try {
                const sessions = await FirestoreService.getSessionsByUser(this.userId, 10);
                return { success: true, sessions };
            } catch (error) {
                console.error('Erro ao buscar estatísticas Firebase:', error);
                return this.request('/stats/recent');
            }
        } else {
            return this.request('/stats/recent');
        }
    }

    async getStatsSummary() {
        if (this.useFirebase && this.userId) {
            try {
                const stats = await FirestoreService.getUserStats(this.userId);
                return { success: true, stats };
            } catch (error) {
                console.error('Erro ao buscar resumo Firebase:', error);
                return this.request('/stats/summary');
            }
        } else {
            return this.request('/stats/summary');
        }
    }

    // Pacientes
    async getPatients() {
        if (this.useFirebase && this.userId) {
            try {
                const patients = await FirestoreService.getPatientsByUser(this.userId);
                return { success: true, patients };
            } catch (error) {
                console.error('Erro ao buscar pacientes Firebase:', error);
                throw error;
            }
        } else {
            throw new Error('Firebase não configurado');
        }
    }

    async createPatient(patientData) {
        if (this.useFirebase && this.userId) {
            try {
                const patient = await FirestoreService.createPatient({
                    ...patientData,
                    userId: this.userId
                });
                return { success: true, patient };
            } catch (error) {
                console.error('Erro ao criar paciente Firebase:', error);
                throw error;
            }
        } else {
            throw new Error('Firebase não configurado');
        }
    }

    async updatePatient(patientId, patientData) {
        if (this.useFirebase && this.userId) {
            try {
                const patient = await FirestoreService.updatePatient(patientId, patientData);
                return { success: true, patient };
            } catch (error) {
                console.error('Erro ao atualizar paciente Firebase:', error);
                throw error;
            }
        } else {
            throw new Error('Firebase não configurado');
        }
    }

    async deletePatient(patientId) {
        if (this.useFirebase && this.userId) {
            try {
                await FirestoreService.deletePatient(patientId);
                return { success: true, message: 'Paciente deletado com sucesso' };
            } catch (error) {
                console.error('Erro ao deletar paciente Firebase:', error);
                throw error;
            }
        } else {
            throw new Error('Firebase não configurado');
        }
    }

    // Saúde
    async healthCheck() {
        return this.request('/health');
    }
}

export default new ApiService();
