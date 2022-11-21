import { useCallback, useEffect, useRef } from "react";

const useDebounce = (fn: Function, delay: number) => {
  const timeoutRef = useRef<number>();

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => clearTimer, []);

  const cb = useCallback(
    (...args: any[]) => {
      clearTimer();
      timeoutRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );

  return cb;
};

export default useDebounce;
