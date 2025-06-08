
import { useEffect, useRef } from 'react';
import { Application } from '@splinetool/runtime';

const SplineBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const app = new Application(canvasRef.current);
      app.load('https://prod.spline.design/kkd1zKM6nM0CUAT3/scene.splinecode');
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ zIndex: 1 }}
    />
  );
};

export default SplineBackground;
