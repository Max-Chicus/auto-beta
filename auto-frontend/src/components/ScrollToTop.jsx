import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll la începutul paginii la fiecare schimbare de rută
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' pentru imediat, 'smooth' pentru animație lină
    });
  }, [pathname]);

  return null; // Nu afișează nimic
}

export default ScrollToTop;