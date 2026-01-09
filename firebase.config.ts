import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Configuração do Firebase
// IMPORTANTE: Substitua com suas credenciais do Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verifica se Firebase está configurado
const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && 
           firebaseConfig.authDomain && 
           firebaseConfig.projectId &&
           firebaseConfig.apiKey !== "sua-api-key-aqui");
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Inicializar Firebase apenas uma vez
export function initializeFirebase() {
  // Se não está configurado, retorna sem inicializar
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase não configurado. Usando apenas armazenamento local.');
    return { app: null, db: null, auth: null };
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    } else {
      app = getApps()[0];
      db = getFirestore(app);
      auth = getAuth(app);
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    return { app: null, db: null, auth: null };
  }
  
  return { app, db, auth };
}

// Login anônimo automático
export async function ensureAuthenticated() {
  if (!isFirebaseConfigured()) {
    return null;
  }

  const { auth } = initializeFirebase();
  
  if (!auth) {
    return null;
  }
  
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
      console.log('✅ Usuário autenticado anonimamente');
    } catch (error) {
      console.error('❌ Erro ao autenticar:', error);
      throw error;
    }
  }
  
  return auth.currentUser;
}

// Obter ID do usuário
export function getUserId(): string | null {
  const { auth } = initializeFirebase();
  return auth.currentUser?.uid || null;
}

// Obter instâncias
export function getFirebaseInstances() {
  return initializeFirebase();
}
