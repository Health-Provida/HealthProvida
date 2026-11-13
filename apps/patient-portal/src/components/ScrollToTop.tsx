    import { useEffect } from 'react';
    import { useLocation } from 'react-router-dom';

    function ScrollToTop() {
      const { pathname } = useLocation();

      useEffect(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth' // Optional: for a smooth scrolling animation
        });
      }, [pathname]); // Re-run effect whenever the pathname changes (i.e., navigation)

      return null; // This component doesn't render any UI
    }

    export default ScrollToTop;