// AuthService desabilitado - usando apenas Firestore Database
/*
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase-rn';
*/

/*
class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.isInitialized = false;
    
    // Verificar se Firebase está funcionando
    this.checkFirebaseConnection();
    
    // Inicializar listener de estado de autenticação
    this.initAuthStateListener();
  }

  // Verificar conexão com Firebase
  async checkFirebaseConnection() {
    try {
      console.log('Verificando conexão Firebase...');
      console.log('Auth instance:', auth);
      console.log('DB instance:', db);
      
      if (!auth || !db) {
        throw new Error('Firebase não foi inicializado corretamente');
      }
      
      console.log('Firebase conectado com sucesso!');
    } catch (error) {
      console.error('Erro na conexão Firebase:', error);
      throw error;
    }
  }

  // Inicializar listener de estado de autenticação
  initAuthStateListener() {
    try {
      console.log('Inicializando listener de auth...');
      onAuthStateChanged(auth, async (user) => {
        console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
        this.currentUser = user;
        this.isInitialized = true;
        
        if (user) {
          // Buscar dados adicionais do usuário no Firestore
          try {
            const userData = await this.getUserData(user.uid);
            this.currentUser = { ...user, ...userData };
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
          }
        }
        
        // Notificar listeners
        this.authListeners.forEach(listener => listener(user));
      });
      console.log('Listener de auth inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar listener de auth:', error);
      this.isInitialized = true;
    }
  }

  // Aguardar inicialização
  async waitForInitialization() {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve();
      } else {
        const checkInitialized = () => {
          if (this.isInitialized) {
            resolve();
          } else {
            setTimeout(checkInitialized, 100);
          }
        };
        checkInitialized();
      }
    });
  }

  // Adicionar listener de mudança de estado
  addAuthStateListener(listener) {
    this.authListeners.push(listener);
    
    // Retornar função para remover listener
    return () => {
      const index = this.authListeners.indexOf(listener);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  // Registrar usuário
  async register(email, password, userData = {}) {
    try {
      console.log('Tentando registrar usuário:', email);
      
      // Verificar se Firebase está funcionando
      if (!auth) {
        throw new Error('Firebase Auth não está disponível');
      }
      
      // Verificar configuração do auth
      console.log('🔍 Verificando configuração do Auth:', {
        apiKey: auth.config?.apiKey ? '✅ Definida' : '❌ Não definida',
        authDomain: auth.config?.authDomain ? '✅ Definida' : '❌ Não definida',
        projectId: auth.app?.options?.projectId ? '✅ Definida' : '❌ Não definida'
      });
      
      if (!auth.config?.apiKey || !auth.app?.options?.projectId) {
        throw new Error('Configuração do Firebase Auth inválida');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuário registrado com sucesso:', user.uid);

      // Salvar dados adicionais do usuário no Firestore
      if (db) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: userData.name || user.email.split('@')[0],
          createdAt: new Date().toISOString(),
          totalSessions: 0,
          totalTime: 0,
          totalScore: 0,
          streakDays: 0,
          ...userData
        });
      }

      return { success: true, user: user, message: 'Usuário registrado com sucesso!' };
    } catch (error) {
       
      console.error('Erro no registro:', error);
      return { success: false, message: this._getErrorMessage(error) };
    }
  }

  // Login
  async login(email, password) {
    try {
      console.log('Tentando fazer login:', email);
      
      // Verificar se Firebase está funcionando
      if (!auth) {
        throw new Error('Firebase Auth não está disponível');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login realizado com sucesso:', user.uid);
      return { success: true, user: user, message: 'Login realizado com sucesso!' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: this._getErrorMessage(error) };
    }
  }

  // Logout
  async logout() {
    try {
      console.log('Tentando fazer logout');
      
      if (!auth) {
        throw new Error('Firebase Auth não está disponível');
      }
      
      await signOut(auth);
      console.log('Logout realizado com sucesso');
      return { success: true, message: 'Logout realizado com sucesso!' };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, message: this._getErrorMessage(error) };
    }
  }

  // Redefinir senha
  async resetPassword(email) {
    try {
      if (!auth) {
        throw new Error('Firebase Auth não está disponível');
      }
      
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Email de redefinição de senha enviado!' };
    } catch (error) {
      console.error('Erro ao enviar redefinição de senha:', error);
      return { success: false, message: this._getErrorMessage(error) };
    }
  }

  // Reenviar email de verificação
  async resendVerificationEmail() {
    try {
      if (!auth) {
        throw new Error('Firebase Auth não está disponível');
      }
      
      if (this.currentUser && !this.currentUser.emailVerified) {
        await sendEmailVerification(this.currentUser);
        return { success: true, message: 'Email de verificação reenviado!' };
      }
      return { success: false, message: 'Usuário não encontrado ou email já verificado' };
    } catch (error) {
      console.error('Erro ao reenviar email de verificação:', error);
      return { success: false, message: this._getErrorMessage(error) };
    }
  }

  // Buscar dados do usuário
  async getUserData(uid) {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }
      
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  }

  // Atualizar perfil do usuário
  async updateUserProfile(uid, profileData) {
    try {
      if (!db) {
        throw new Error('Firestore não está disponível');
      }
      
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, profileData);
      return { success: true, message: 'Perfil atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: this._getErrorMessage(error) };
    }
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Verificar se email está verificado
  isEmailVerified() {
    return this.currentUser?.emailVerified || false;
  }

  // Obter ID do usuário atual
  getCurrentUserId() {
    return this.currentUser?.uid || null;
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Converter códigos de erro do Firebase em mensagens amigáveis
  _getErrorMessage(error) {
    console.log('Código do erro:', error.code);
    console.log('Mensagem do erro:', error.message);
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso.';
      case 'auth/invalid-email':
        return 'O formato do email é inválido.';
      case 'auth/operation-not-allowed':
        return 'Operação não permitida. Entre em contato com o suporte.';
      case 'auth/weak-password':
        return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.';
      case 'auth/user-not-found':
        return 'Usuário não encontrado.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Credenciais inválidas.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      case 'auth/configuration-not-found':
        return 'Método de autenticação não ativado. Ative Email/Senha no Firebase Console.';
      default:
        return `Ocorreu um erro inesperado: ${error.message}`;
    }
  }
}
*/

// Exportar um objeto vazio para manter compatibilidade
const AuthServiceMock = {
  register: async (email, password, userData = {}) => {
    try {
      // Importar FirestoreService dinamicamente para evitar dependência circular
      const FirestoreService = (await import('./FirestoreService')).default;
      
      // Criar usuário no Firestore
      const userRecord = {
        email: email,
        name: userData.name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        totalSessions: 0,
        totalTime: 0,
        totalScore: 0,
        streakDays: 0,
        ...userData
      };
      
      const result = await FirestoreService.createUser(userRecord);
      
      return { 
        success: true, 
        user: result, 
        message: 'Usuário criado com sucesso no Firestore!' 
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { 
        success: false, 
        message: `Erro ao criar usuário: ${error.message}` 
      };
    }
  },
  
  login: async (email, _password) => {
    try {
      // Importar FirestoreService dinamicamente
      const FirestoreService = (await import('./FirestoreService')).default;
      
      // Buscar usuário no Firestore por email
      const users = await FirestoreService.getUsersByEmail(email);
      
      if (users.length > 0) {
        return { 
          success: true, 
          user: users[0], 
          message: 'Login realizado com sucesso!' 
        };
      } else {
        return { 
          success: false, 
          message: 'Usuário não encontrado' 
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: `Erro no login: ${error.message}` 
      };
    }
  },
  
  logout: () => ({ success: true, message: 'Logout realizado com sucesso!' }),
  isAuthenticated: () => false,
  isEmailVerified: () => false,
  getCurrentUserId: () => null,
  getCurrentUser: () => null,
  addAuthStateListener: () => () => {},
  waitForInitialization: () => Promise.resolve(),
};

export default AuthServiceMock;