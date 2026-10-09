import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for smooth auto-refresh of admin data
 * Polls silently in background without UI interruption
 * 
 * @param {Function} fetchFn - Async function that fetches data
 * @param {number} interval - Refresh interval in ms (default: 10000ms = 10s)
 * @param {boolean} enabled - Enable/disable polling (default: true)
 */
export function useAutoRefresh(fetchFn, interval = 10000, enabled = true) {
  const intervalRef = useRef(null);
  const fetchFnRef = useRef(fetchFn);

  // Update ref when fetchFn changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const refresh = useCallback(async () => {
    try {
      await fetchFnRef.current();
    } catch (error) {
      console.error('Auto-refresh error:', error);
      // Silent fail - don't show error to user
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Initial refresh
    refresh();

    // Set up polling interval
    intervalRef.current = setInterval(refresh, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh, interval, enabled]);
}

/**
 * Hook for smart refresh - only refresh if user is not actively interacting
 */
export function useSmartAutoRefresh(fetchFn, interval = 10000) {
  const isUserActiveRef = useRef(false);
  const timeoutRef = useRef(null);
  const fetchFnRef = useRef(fetchFn);

  // Update ref when fetchFn changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const handleUserActivity = () => {
      isUserActiveRef.current = true;
      
      // Clear timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // After 5 seconds of no activity, enable polling again
      timeoutRef.current = setTimeout(() => {
        isUserActiveRef.current = false;
      }, 5000);
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, true);
    });

    // Use normal auto-refresh but skip if user is active
    const wrappedFetch = async () => {
      if (!isUserActiveRef.current) {
        try {
          await fetchFnRef.current();
        } catch (error) {
          console.error('Auto-refresh error:', error);
        }
      }
    };

    // Call initial refresh
    wrappedFetch();

    // Set up interval
    const intervalId = setInterval(wrappedFetch, interval);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity, true);
      });
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [interval]);
}
