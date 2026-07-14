import { useInView } from 'react-intersection-observer';

export const useScrollAnimation = (threshold: number = 0.1) => {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true
  });

  return {
    ref,
    className: `fade-up-enter ${inView ? 'fade-up-active' : ''}`
  };
};
