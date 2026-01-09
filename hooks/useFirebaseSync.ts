import { useEffect, useState, useCallback } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getFirebaseInstances, ensureAuthenticated, getUserId } from '../firebase.config';
import { UserProgress } from '../types';

export function useFirebaseSync() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Inicializar Firebase e autenticar
  useEffect(() => {
    const init = async () => {
      try {
        const result = await ensureAuthenticated();
        
        // Se Firebase não está configurado ou falhou
        if (!result) {
          console.log('💾 Modo LOCAL: Progresso salvo apenas neste dispositivo (localStorage)');
          setIsInitialized(false);
          setSyncError('Firebase não configurado - usando apenas localStorage');
          return;
        }

        console.log('☁️ Modo CLOUD: Progresso sincronizado entre dispositivos');
        setIsInitialized(true);
      } catch (error) {
        console.warn('⚠️ Não foi possível conectar ao Firebase. Usando modo local.', error);
        setIsInitialized(false);
        setSyncError('Sem conexão cloud - salvando localmente');
      }
    };
    
    init();
  }, []);

  // Salvar progresso no Firebase
  const saveProgress = useCallback(async (progress: UserProgress) => {
    if (!isInitialized) {
      console.warn('Firebase não inicializado ainda');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      console.warn('Usuário não autenticado');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const { db } = getFirebaseInstances();
      const docRef = doc(db, 'userProgress', userId);
      
      await setDoc(docRef, {
        ...progress,
        lastUpdated: serverTimestamp(),
        syncedAt: serverTimestamp()
      }, { merge: true });

      setLastSyncTime(new Date());
      console.log('✅ Progresso salvo no Firebase');
    } catch (error) {
      console.error('❌ Erro ao salvar progresso:', error);
      setSyncError('Erro ao salvar progresso');
    } finally {
      setIsSyncing(false);
    }
  }, [isInitialized]);

  // Carregar progresso do Firebase
  const loadProgress = useCallback(async (): Promise<UserProgress | null> => {
    if (!isInitialized) {
      console.warn('Firebase não inicializado ainda');
      return null;
    }

    const userId = getUserId();
    if (!userId) {
      console.warn('Usuário não autenticado');
      return null;
    }

    try {
      const { db } = getFirebaseInstances();
      const docRef = doc(db, 'userProgress', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Progresso carregado do Firebase');
        
        // Converter Timestamp do Firebase para Date
        return {
          ...data,
          lastUpdated: data.lastUpdated instanceof Timestamp 
            ? data.lastUpdated.toDate() 
            : new Date(data.lastUpdated)
        } as UserProgress;
      } else {
        console.log('ℹ️ Nenhum progresso encontrado no Firebase');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar progresso:', error);
      setSyncError('Erro ao carregar progresso');
      return null;
    }
  }, [isInitialized]);

  // Sincronização em tempo real
  const subscribeToProgress = useCallback((
    onUpdate: (progress: UserProgress) => void
  ) => {
    if (!isInitialized) {
      console.warn('Firebase não inicializado ainda');
      return () => {};
    }

    const userId = getUserId();
    if (!userId) {
      console.warn('Usuário não autenticado');
      return () => {};
    }

    const { db } = getFirebaseInstances();
    const docRef = doc(db, 'userProgress', userId);

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const progress = {
          ...data,
          lastUpdated: data.lastUpdated instanceof Timestamp 
            ? data.lastUpdated.toDate() 
            : new Date(data.lastUpdated)
        } as UserProgress;
        
        onUpdate(progress);
        setLastSyncTime(new Date());
        console.log('🔄 Progresso atualizado em tempo real');
      }
    }, (error) => {
      console.error('❌ Erro na sincronização em tempo real:', error);
      setSyncError('Erro na sincronização');
    });

    return unsubscribe;
  }, [isInitialized]);

  return {
    isInitialized,
    isSyncing,
    lastSyncTime,
    syncError,
    saveProgress,
    loadProgress,
    subscribeToProgress
  };
}
