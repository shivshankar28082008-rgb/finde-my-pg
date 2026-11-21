import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface Tilt3DCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function Tilt3DCard({
  children,
  className = '',
  maxTilt = 6,
}: Tilt3DCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, hovered: false });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - py) * maxTilt * 2;
    setTransform({
      rotateX,
      rotateY,
      glowX: px * 100,
      glowY: py * 100,
      hovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, hovered: false });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 h-full ${className}`}
    >
      <motion.div
        animate={{
          rotateX: prefersReducedMotion ? 0 : transform.rotateX,
          rotateY: prefersReducedMotion ? 0 : transform.rotateY,
          y: transform.hovered && !prefersReducedMotion ? -4 : 0,
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 24, mass: 0.6 }}
        className="relative h-full preserve-3d rounded-xl"
      >
        {children}
        {transform.hovered && !prefersReducedMotion && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl opacity-60 transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${transform.glowX}% ${transform.glowY}%, rgba(99, 102, 241, 0.14), transparent 60%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
