import { useEffect, useState } from 'react';

const useSize = (): [number, number] => {
  const [windowSize, setWindowSize] = useState<[number, number]>([
    window.innerHeight,
    window.innerWidth,
  ]);

  useEffect(() => {
    const windowSizeHandler = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', windowSizeHandler);
    return () => {
      window.removeEventListener('resize', windowSizeHandler);
    };
  }, []);

  return windowSize;
};

export default useSize;
