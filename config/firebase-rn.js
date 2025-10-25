// Firebase Configuration específica para React Native/Expo - APENAS FIRESTORE
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase - valores hardcoded para resolver o erro de configuração
const firebaseConfig = {
  apiKey: "AIzaSyAmIULnmG2QezI_JWQYUpxBD_9GzOd08ZI",
  authDomain: "aetheria-70828.firebaseapp.com",
  projectId: "aetheria-70828",
  storageBucket: "aetheria-70828.firebasestorage.app",
  messagingSenderId: "372690668887",
  appId: "1:372690668887:web:ea847f01ab661c7feb4212",
};

// Validação da configuração
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('❌ Configuração do Firebase inválida - apiKey ou projectId não definidos');
}

console.log('🚀 Inicializando Firebase para React Native (APENAS FIRESTORE)...');
console.log('🔧 Configuração carregada:', {
  apiKey: firebaseConfig.apiKey ? '✅ Definida' : '❌ Não definida',
  authDomain: firebaseConfig.authDomain ? '✅ Definida' : '❌ Não definida',
  projectId: firebaseConfig.projectId ? '✅ Definida' : '❌ Não definida',
  appId: firebaseConfig.appId ? '✅ Definida' : '❌ Não definida'
});

console.log('🔍 Debug - Configuração final:', firebaseConfig);

// Verificar se já existe uma instância do Firebase
let app;
try {
  if (getApps().length === 0) {
    console.log('📱 Criando nova instância do Firebase...');
    app = initializeApp(firebaseConfig, 'AetheriaApp');
  } else {
    console.log('📱 Usando instância existente do Firebase...');
    app = getApp('AetheriaApp');
  }
  console.log('✅ Firebase App:', app.name);
  console.log('🔍 App config:', app.options);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase App:', error);
  throw error;
}

// Inicializar APENAS Firestore
let db;
try {
  db = getFirestore(app);
  console.log('✅ Firebase Firestore inicializado');
  console.log('🔍 db object:', db);
  console.log('🔍 db type:', typeof db);
  console.log('🔍 db app:', db.app);
  console.log('🔍 db app name:', db.app.name);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Firestore:', error);
  throw error;
}

// Verificação final
if (!db) {
  throw new Error('❌ Firebase Firestore não foi inicializado corretamente');
}

console.log('🎉 Firebase Firestore completamente configurado para React Native!');
console.log('🔍 Exportando db:', db);

export { db };
export default app;
