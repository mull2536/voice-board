import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing hover-to-activate functionality
 * Provides progressive hover indication and automatic activation
 */
export function useHover(onActivate, duration = 2000, disabled = false) {
  const [isHovering, setIsHovering] = useState(false);
  const [progress, setProgress] = useState(0);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const startHover = useCallback(() => {
    if (disabled) return;

    setIsHovering(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    // Clear any existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start progress animation
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(intervalRef.current);
      }
    }, 16); // ~60fps

    // Set activation timeout
    timeoutRef.current = setTimeout(() => {
      if (onActivate) {
        onActivate();
      }
      resetHover();
    }, duration);
  }, [disabled, duration, onActivate]);

  const stopHover = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsHovering(false);
    setProgress(0);
    startTimeRef.current = null;
  }, []);

  const resetHover = useCallback(() => {
    stopHover();
  }, [stopHover]);

  // Cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Reset on duration change
  useEffect(() => {
    if (isHovering) {
      stopHover();
    }
  }, [duration, disabled]);

  return {
    isHovering,
    progress,
    startHover,
    stopHover,
    resetHover,
    // Event handlers for convenience
    onMouseEnter: startHover,
    onMouseLeave: stopHover,
    // Touch support for mobile
    onTouchStart: startHover,
    onTouchEnd: stopHover,
    onTouchCancel: stopHover
  };
}

/**
 * Hook for managing multiple hover states (useful for grids)
 */
export function useMultiHover(onActivate, duration = 2000, disabled = false) {
  const [hoverStates, setHoverStates] = useState({});
  const timersRef = useRef({});

  const startHover = useCallback((id) => {
    if (disabled) return;

    // Clear existing timer for this id
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id].timeout);
      clearInterval(timersRef.current[id].interval);
    }

    const startTime = Date.now();

    setHoverStates(prev => ({
      ...prev,
      [id]: { isHovering: true, progress: 0 }
    }));

    // Progress animation
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setHoverStates(prev => ({
        ...prev,
        [id]: { ...prev[id], progress }
      }));

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 16);

    // Activation timeout
    const timeout = setTimeout(() => {
      if (onActivate) {
        onActivate(id);
      }
      stopHover(id);
    }, duration);

    timersRef.current[id] = { timeout, interval };
  }, [disabled, duration, onActivate]);

  const stopHover = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id].timeout);
      clearInterval(timersRef.current[id].interval);
      delete timersRef.current[id];
    }

    setHoverStates(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }, []);

  const getHoverProps = useCallback((id) => ({
    onMouseEnter: () => startHover(id),
    onMouseLeave: () => stopHover(id),
    onTouchStart: () => startHover(id),
    onTouchEnd: () => stopHover(id),
    onTouchCancel: () => stopHover(id)
  }), [startHover, stopHover]);

  const getHoverState = useCallback((id) =>
    hoverStates[id] || { isHovering: false, progress: 0 }
  , [hoverStates]);

  // Cleanup
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(({ timeout, interval }) => {
        clearTimeout(timeout);
        clearInterval(interval);
      });
    };
  }, []);

  return {
    hoverStates,
    startHover,
    stopHover,
    getHoverProps,
    getHoverState
  };
}

/**
 * Hook for managing hover with dwell time and multiple activation modes
 */
export function useAdvancedHover(options = {}) {
  const {
    onActivate,
    onHoverStart,
    onHoverEnd,
    onProgress,
    duration = 2000,
    disabled = false,
    requireContinuousHover = true,
    activateOnClick = true,
    debounceMs = 50
  } = options;

  const [state, setState] = useState({
    isHovering: false,
    progress: 0,
    isActive: false
  });

  const timersRef = useRef({});
  const debounceRef = useRef(null);

  const activate = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }));
    if (onActivate) onActivate();

    // Reset after a short delay
    setTimeout(() => {
      setState(prev => ({ ...prev, isActive: false }));
    }, 200);
  }, [onActivate]);

  const startHover = useCallback(() => {
    if (disabled) return;

    // Debounce hover start
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isHovering: true, progress: 0 }));
      if (onHoverStart) onHoverStart();

      const startTime = Date.now();

      // Progress tracking
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);

        setState(prev => ({ ...prev, progress }));
        if (onProgress) onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 16);

      // Activation timeout
      const timeout = setTimeout(() => {
        activate();
      }, duration);

      timersRef.current = { interval, timeout };
    }, debounceMs);
  }, [disabled, duration, onHoverStart, onProgress, activate, debounceMs]);

  const stopHover = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (timersRef.current.timeout) {
      clearTimeout(timersRef.current.timeout);
    }
    if (timersRef.current.interval) {
      clearInterval(timersRef.current.interval);
    }

    setState(prev => ({ ...prev, isHovering: false, progress: 0 }));
    if (onHoverEnd) onHoverEnd();
  }, [onHoverEnd]);

  const handleClick = useCallback(() => {
    if (activateOnClick && !disabled) {
      activate();
    }
  }, [activateOnClick, disabled, activate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (timersRef.current.timeout) clearTimeout(timersRef.current.timeout);
      if (timersRef.current.interval) clearInterval(timersRef.current.interval);
    };
  }, []);

  return {
    ...state,
    handlers: {
      onMouseEnter: startHover,
      onMouseLeave: stopHover,
      onClick: handleClick,
      onTouchStart: startHover,
      onTouchEnd: stopHover,
      onTouchCancel: stopHover
    }
  };
}