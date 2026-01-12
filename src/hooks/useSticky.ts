import { useEffect, useState, useRef } from 'react';

export function useSticky<T extends HTMLElement = HTMLDivElement>(offset: number = 0) {
  const [isSticky, setIsSticky] = useState(false);
  const elementRef = useRef<T>(null);
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      
      if (window.scrollY > elementTop - offset) {
        setIsSticky(true);
        setTopOffset(offset);
      } else {
        setIsSticky(false);
        setTopOffset(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offset]);

  return { elementRef, isSticky, topOffset };
}
