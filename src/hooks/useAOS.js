import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';

export const useAOS = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize AOS if not already initialized
    if (!AOS.initialized) {
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100,
        delay: 0,
        disable: false,
      });
    }

    // Refresh AOS when location changes
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [location]);
};
