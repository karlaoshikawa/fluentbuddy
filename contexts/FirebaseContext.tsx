import React, { createContext, useContext, useEffect, useState } from 'react';
import { ensureAuthenticated } from '../firebase.config';

interface FirebaseContextType {
  isInitialized: boolean;
  isAuthenticating: boolean;
  authError: string | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  isInitialized: false,
  isAuthenticating: true,
  authError: null
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await ensureAuthenticated();
        
        if (!result) {
          setIsInitialized(false);
          setAuthError('Firebase não configurado - usando apenas localStorage');
        } else {
          setIsInitialized(true);
          setAuthError(null);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao inicializar Firebase:', error);
        setIsInitialized(false);
        setAuthError('Erro ao conectar - usando modo local');
      } finally {
        setIsAuthenticating(false);
      }
    };

    init();
  }, []);

  return (
    <FirebaseContext.Provider value={{ isInitialized, isAuthenticating, authError }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseContext() {
  return useContext(FirebaseContext);
}
