import { useEffect, useRef, useState } from 'react';

export const useThrottle = <V>(value: V, wait: number) => {
  const [throttledValue, setThrottledValue] = useState<V>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + wait) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, wait);

      return () => clearTimeout(timerId);
    }
  }, [value, wait]);

  return throttledValue;
};
