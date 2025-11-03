'use client';

import { useEffect, useRef } from 'react';
import { CanvasSceneRenderer } from '@/lib/webgl/CanvasSceneRenderer';
import { useIsMobile, usePrefersReducedMotion } from '@/lib/hooks/useMediaQuery';

interface PixelSceneProps {
  className?: string;
}

/**
 * PixelScene Component
 * Renders the Puddle pixel-art scene with editable layers
 */
export function PixelScene({ className = '' }: PixelSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasSceneRenderer | null>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion) return;

    const renderer = new CanvasSceneRenderer(canvasRef.current);
    rendererRef.current = renderer;
    
    // Load the scene image
    renderer.loadSceneImage('/images/scenery.png').then(() => {
      console.log('Scene image loaded successfully');
    }).catch((error: Error) => {
      console.error('Failed to load scene image:', error);
    });
    
    renderer.start();

    // Handle window resize
    const handleResize = () => {
      renderer.resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      renderer.stop();
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
      rendererRef.current = null;
    };
  }, [prefersReducedMotion]);

  return (
    <div className={`relative w-full h-screen ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
}
