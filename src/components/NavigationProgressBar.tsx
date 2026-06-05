import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
nprogress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08
});

export const NavigationProgressBar = () => {
  const location = useLocation();

  useEffect(() => {
    nprogress.start();
    const timer = setTimeout(() => {
      nprogress.done();
    }, 100);

    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
  }, [location.pathname, location.search]);

  return null;
};
