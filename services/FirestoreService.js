import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
// Importar db dinamicamente para evitar problemas de inicialização
let db;

// Função para obter db de forma segura
const getDb = () => {
  if (!db) {
    try {
      const firebaseConfig = require('../config/firebase-rn');
      db = firebaseConfig.db;
      console.log('🔍 FirestoreService - db carregado:', db);
    } catch (error) {
      console.error('❌ Erro ao carregar db:', error);
      throw new Error('Firestore não está inicializado');
    }
  }
  return db;
};

// Collections
const COLLECTIONS = {
  USERS: 'users',
  SESSIONS: 'sessions',
  SCORES: 'scores',
  PATIENTS: 'patients'
};

class FirestoreService {
  // User operations
  async createUser(userData) {
    try {
      const firestoreDb = getDb();
      console.log('🔍 createUser - db:', firestoreDb);
      console.log('🔍 createUser - COLLECTIONS.USERS:', COLLECTIONS.USERS);

      const docRef = await addDoc(collection(firestoreDb, COLLECTIONS.USERS), {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const firestoreDb = getDb();
      const docRef = doc(firestoreDb, COLLECTIONS.USERS, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async getUsersByEmail(email) {
    try {
      const firestoreDb = getDb();
      console.log('🔍 getUsersByEmail - db:', firestoreDb);
      console.log('🔍 getUsersByEmail - COLLECTIONS.USERS:', COLLECTIONS.USERS);

      const q = query(
        collection(firestoreDb, COLLECTIONS.USERS),
        where('email', '==', email)
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return users;
    } catch (error) {
      console.error('Erro ao buscar usuários por email:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const firestoreDb = getDb();
      const docRef = doc(firestoreDb, COLLECTIONS.USERS, userId);
      await updateDoc(docRef, {
        ...userData,
        updatedAt: Timestamp.now()
      });
      return { id: userId, ...userData };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Session operations
  async createSession(sessionData) {
    try {
      const firestoreDb = getDb();
      const docRef = await addDoc(collection(firestoreDb, COLLECTIONS.SESSIONS), {
        ...sessionData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...sessionData };
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  async getSessionsByUser(userId, limitCount = 10) {
    try {
      const q = query(
        collection(getDb(), COLLECTIONS.SESSIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      
      return sessions;
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }
  }

  async updateSession(sessionId, sessionData) {
    try {
      const docRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
      await updateDoc(docRef, {
        ...sessionData,
        updatedAt: Timestamp.now()
      });
      return { id: sessionId, ...sessionData };
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw error;
    }
  }

  // Score operations
  async createScore(scoreData) {
    try {
      const docRef = await addDoc(collection(getDb(), COLLECTIONS.SCORES), {
        ...scoreData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...scoreData };
    } catch (error) {
      console.error('Erro ao criar pontuação:', error);
      throw error;
    }
  }

  async getScoresByUser(userId, limitCount = 20) {
    try {
      const q = query(
        collection(getDb(), COLLECTIONS.SCORES),
        where('userId', '==', userId),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const scores = [];
      
      querySnapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() });
      });
      
      return scores;
    } catch (error) {
      console.error('Erro ao buscar pontuações:', error);
      throw error;
    }
  }

  // Patient operations
  async createPatient(patientData) {
    try {
      const docRef = await addDoc(collection(getDb(), COLLECTIONS.PATIENTS), {
        ...patientData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...patientData };
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  }

  async getPatientsByUser(userId) {
    try {
      const q = query(
        collection(getDb(), COLLECTIONS.PATIENTS),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const patients = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      
      // Ordenar em memória pela data de criação
      patients.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate; // Ordem decrescente (mais recente primeiro)
      });
      
      return patients;
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  async updatePatient(patientId, patientData) {
    try {
      const firestoreDb = getDb();
      const docRef = doc(firestoreDb, COLLECTIONS.PATIENTS, patientId);
      await updateDoc(docRef, {
        ...patientData,
        updatedAt: Timestamp.now()
      });
      return { id: patientId, ...patientData };
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  async deletePatient(patientId) {
    try {
      const firestoreDb = getDb();
      const docRef = doc(firestoreDb, COLLECTIONS.PATIENTS, patientId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar paciente:', error);
      throw error;
    }
  }

  // Statistics operations
  async getUserStats(userId) {
    try {
      const [sessions, scores] = await Promise.all([
        this.getSessionsByUser(userId, 100),
        this.getScoresByUser(userId, 100)
      ]);

      const totalSessions = sessions.length;
      const totalTime = sessions.reduce((acc, session) => acc + (session.duration || 0), 0);
      const totalScore = scores.reduce((acc, score) => acc + (score.score || 0), 0);
      const averageScore = totalSessions > 0 ? totalScore / totalSessions : 0;
      const averageDuration = totalSessions > 0 ? totalTime / totalSessions : 0;

      return {
        totalSessions,
        totalTime,
        totalScore,
        averageScore,
        averageDuration,
        streakDays: this.calculateStreak(sessions)
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  calculateStreak(sessions) {
    if (sessions.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    const currentDate = new Date(today);
    
    // Sort sessions by date
    const sortedSessions = sessions
      .filter(session => session.completed)
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    
    for (const session of sortedSessions) {
      const sessionDate = session.createdAt.toDate();
      const sessionDateStr = sessionDate.toDateString();
      const currentDateStr = currentDate.toDateString();
      
      if (sessionDateStr === currentDateStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDateStr === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }
}

export default new FirestoreService();
