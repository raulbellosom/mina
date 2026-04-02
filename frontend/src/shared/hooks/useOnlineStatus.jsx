import { useState, useEffect, useCallback } from "react";

/**
 * Hook para detectar el estado de conectividad del navegador.
 *
 * Retorna { isOnline, wasOffline } donde wasOffline indica que
 * estuvo offline en algún momento de la sesión (para mostrar avisos de sync).
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const clearWasOffline = useCallback(() => setWasOffline(false), []);

  return { isOnline, wasOffline, clearWasOffline };
}
