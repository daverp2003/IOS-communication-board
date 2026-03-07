import { useState, useEffect } from "react";

/**
 * useOnlineStatus — tracks browser online/offline state.
 * Returns { isOnline, wasOffline }
 *   isOnline   — current connection state
 *   wasOffline — true if we went offline at least once this session
 *                (useful to show "back online" messaging)
 */
export function useOnlineStatus() {
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
