// Exemplo de uso do Firebase no Aetheria App
import ApiService from './services/ApiService';
import FirestoreService from './services/FirestoreService';

// Exemplo 1: Login e criação de usuário
async function exemploLogin() {
  try {
    const result = await ApiService.login('usuario@exemplo.com', 'senha123');
    console.log('Login realizado:', result);
  } catch (error) {
    console.error('Erro no login:', error);
  }
}

// Exemplo 2: Criar uma sessão de jogo
async function exemploSessaoJogo() {
  try {
    // Iniciar sessão
    const session = await ApiService.startGameSession('boat');
    console.log('Sessão iniciada:', session);

    // Simular jogo (pontuação e duração)
    const score = 150;
    const duration = 120; // 2 minutos
    const completed = true;

    // Finalizar sessão
    const result = await ApiService.endGameSession(session.session.id, score, duration, completed);
    console.log('Sessão finalizada:', result);
  } catch (error) {
    console.error('Erro na sessão:', error);
  }
}

// Exemplo 3: Gerenciar pacientes
async function exemploPacientes() {
  try {
    // Criar paciente
    const paciente = await ApiService.createPatient({
      name: 'João Silva',
      age: 45,
      diagnosis: 'DPOC',
      notes: 'Paciente com dificuldades respiratórias'
    });
    console.log('Paciente criado:', paciente);

    // Buscar pacientes
    const pacientes = await ApiService.getPatients();
    console.log('Lista de pacientes:', pacientes);

    // Atualizar paciente
    const pacienteAtualizado = await ApiService.updatePatient(paciente.patient.id, {
      notes: 'Paciente respondendo bem ao tratamento'
    });
    console.log('Paciente atualizado:', pacienteAtualizado);
  } catch (error) {
    console.error('Erro com pacientes:', error);
  }
}

// Exemplo 4: Buscar estatísticas
async function exemploEstatisticas() {
  try {
    const stats = await ApiService.getStatsSummary();
    console.log('Estatísticas do usuário:', stats);

    const recentSessions = await ApiService.getRecentStats();
    console.log('Sessões recentes:', recentSessions);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  }
}

// Exemplo 5: Uso direto do FirestoreService
async function exemploFirestoreDireto() {
  try {
    // Criar usuário diretamente
    const user = await FirestoreService.createUser({
      email: 'teste@exemplo.com',
      name: 'Usuário Teste',
      totalSessions: 0,
      totalTime: 0,
      totalScore: 0,
      streakDays: 0
    });
    console.log('Usuário criado:', user);

    // Buscar usuário
    const userFound = await FirestoreService.getUser(user.id);
    console.log('Usuário encontrado:', userFound);

    // Calcular estatísticas
    const stats = await FirestoreService.getUserStats(user.id);
    console.log('Estatísticas calculadas:', stats);
  } catch (error) {
    console.error('Erro no Firestore:', error);
  }
}

// Exemplo 6: Configuração de ambiente
function exemploConfiguracao() {
  // Verificar se Firebase está habilitado
  console.log('Firebase habilitado:', ApiService.useFirebase);

  // Desabilitar Firebase (fallback para API local)
  // ApiService.useFirebase = false;

  // Verificar configuração
  console.log('Configuração atual:', {
    userId: ApiService.userId,
    token: ApiService.token ? 'Presente' : 'Ausente'
  });
}

export {
  exemploLogin,
  exemploSessaoJogo,
  exemploPacientes,
  exemploEstatisticas,
  exemploFirestoreDireto,
  exemploConfiguracao
};
