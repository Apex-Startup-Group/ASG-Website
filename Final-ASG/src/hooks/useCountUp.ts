import { useState, useEffect } from 'react';

export const useCountUp = (target: number, duration: number = 2000, startTrigger: boolean = false): number => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startTrigger) return;
    
    let startTimestamp: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out expo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * (target - startValue) + startValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [target, duration, startTrigger]);

  return count;
};
