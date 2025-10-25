// Firebase Configuration para Expo - APENAS FIRESTORE
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - valores hardcoded para resolver o erro de configuração
const firebaseConfig = {
  apiKey: "AIzaSyAmIULnmG2QezI_JWQYUpxBD_9GzOd08ZI",
  authDomain: "aetheria-70828.firebaseapp.com",
  projectId: "aetheria-70828",
  storageBucket: "aetheria-70828.firebasestorage.app",
  messagingSenderId: "372690668887",
  appId: "1:372690668887:web:ea847f01ab661c7feb4212",
};

console.log('🔧 Inicializando Firebase (APENAS FIRESTORE)...');
console.log('📋 Configuração:', {
  apiKey: firebaseConfig.apiKey ? '✅ Definida' : '❌ Não definida',
  authDomain: firebaseConfig.authDomain ? '✅ Definida' : '❌ Não definida',
  projectId: firebaseConfig.projectId ? '✅ Definida' : '❌ Não definida',
  appId: firebaseConfig.appId ? '✅ Definida' : '❌ Não definida'
});

// Initialize Firebase App
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase App inicializado:', app.name);
  } else {
    app = getApp();
    console.log('✅ Firebase App já estava inicializado:', app.name);
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase App:', error);
  throw error;
}

// Initialize APENAS Firestore
let db;
try {
  db = getFirestore(app);
  console.log('✅ Firebase Firestore inicializado');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Firestore:', error);
  throw error;
}

console.log('🎉 Firebase Firestore completamente inicializado!');
console.log('📊 Status dos serviços:', {
  app: app ? '✅ App disponível' : '❌ App não disponível',
  db: db ? '✅ Firestore disponível' : '❌ Firestore não disponível'
});

export { db };
export default app;
