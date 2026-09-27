import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export type AmbientBackgroundVariant = 'constellation' | 'neural-mesh' | 'cyber-grid' | 'ambient-flow';

export interface AmbientBackgroundProps {
  variant?: AmbientBackgroundVariant;
  density?: 'low' | 'medium' | 'high';
  particleCount?: number;
  speed?: number;
  interactive?: boolean;
  interactiveRadius?: number;
  accentColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  showNebula?: boolean;
  showGrid?: boolean;
  showVignette?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  layer: number;
}

const DENSITY_MAP: Record<AmbientBackgroundVariant, Record<'low' | 'medium' | 'high', number>> = {
  constellation: { low: 35, medium: 60, high: 95 },
  'neural-mesh': { low: 45, medium: 75, high: 120 },
  'cyber-grid': { low: 30, medium: 50, high: 80 },
  'ambient-flow': { low: 40, medium: 70, high: 110 },
};

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'constellation',
  density = 'medium',
  particleCount: customCount,
  speed = 1.0,
  interactive = true,
  interactiveRadius = 150,
  accentColor: customAccent,
  secondaryColor: customSecondary,
  tertiaryColor: customTertiary,
  showNebula = true,
  showGrid = true,
  showVignette = true,
  className = '',
  children,
}) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const [isVisible, setIsVisible] = useState(true);

  const accentColor = customAccent || (isDark ? '#6366f1' : '#4f46e5');
  const secondaryColor = customSecondary || (isDark ? '#a855f7' : '#9333ea');
  const tertiaryColor = customTertiary || (isDark ? '#06b6d4' : '#0284c7');
  const colors = useMemo(() => [accentColor, secondaryColor, tertiaryColor], [accentColor, secondaryColor, tertiaryColor]);
  const particleCount = useMemo(() => customCount && customCount > 0 ? customCount : DENSITY_MAP[variant][density], [variant, density, customCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isVisible) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = Math.max(rect.width, 320);
      h = Math.max(rect.height, 320);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      particles = Array.from({ length: particleCount }, () => {
        const layer = Math.random() > 0.65 ? 2 : Math.random() > 0.3 ? 1 : 0;
        const angle = Math.random() * Math.PI * 2;
        const vel = (layer === 2 ? 0.35 : layer === 1 ? 0.22 : 0.1) * speed;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * vel,
          vy: Math.sin(angle) * vel,
          r: layer === 2 ? 2.5 : layer === 1 ? 1.8 : 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: isDark ? (layer === 2 ? 0.85 : layer === 1 ? 0.6 : 0.35) : (layer === 2 ? 0.95 : layer === 1 ? 0.75 : 0.5),
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulsePhase: Math.random() * Math.PI * 2,
          layer,
        };
      });
    };

    resize();
    let resizeTimer: number;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener('resize', onResize);

    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
    };
    const onPointerLeave = () => { mouseRef.current = { x: -9999, y: -9999, active: false }; };
    const target = container.parentElement || container;
    target.addEventListener('pointermove', onPointerMove as any);
    target.addEventListener('pointerleave', onPointerLeave as any);

    const maxDist = variant === 'neural-mesh' ? 140 : variant === 'cyber-grid' ? 120 : 130;
    const maxDistSq = maxDist * maxDist;
    const mouseRadiusSq = interactiveRadius * interactiveRadius;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      ctx.clearRect(0, 0, w, h);
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += p.pulseSpeed;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        if (interactive && mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouseRadiusSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / interactiveRadius) * 18 * (p.layer + 1) * 0.4;
            p.x -= (dx / dist) * force * dt * 2.0;
            p.y -= (dy / dist) * force * dt * 2.0;
          }
        }

        const maxConns = variant === 'neural-mesh' ? 4 : 3;
        let conns = 0;
        for (let j = i + 1; j < particles.length; j++) {
          if (conns >= maxConns) break;
          const p2 = particles[j];
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            conns++;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - Math.sqrt(distSq) / maxDist) * (isDark ? 0.22 : 0.32) * Math.min(p.alpha, p2.alpha);
            ctx.lineWidth = variant === 'neural-mesh' ? 0.9 : 0.75;
            ctx.stroke();
          }
        }

        if (interactive && mouse.active) {
          const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
          const mDistSq = mdx * mdx + mdy * mdy;
          if (mDistSq < mouseRadiusSq) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = tertiaryColor;
            ctx.globalAlpha = (1 - Math.sqrt(mDistSq) / interactiveRadius) * (isDark ? 0.25 : 0.35) * p.alpha;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        const currR = p.r * (0.88 + Math.sin(p.pulsePhase) * 0.2);
        if (p.layer >= 1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, currR * 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * (isDark ? 0.15 : 0.1);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, currR, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
      target.removeEventListener('pointermove', onPointerMove as any);
      target.removeEventListener('pointerleave', onPointerLeave as any);
    };
  }, [isVisible, particleCount, speed, interactive, interactiveRadius, colors, variant, isDark, tertiaryColor]);

  const containerClasses = children
    ? `relative w-full overflow-hidden ${className}`
    : `absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`;

  return (
    <div ref={containerRef} className={containerClasses}>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-gray-950 pointer-events-none transition-colors duration-300" />
      {showNebula && (
        <>
          <div className="absolute -top-24 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-25 dark:opacity-50 animate-gradient-drift transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${accentColor} 0%, rgba(99, 102, 241, 0) 70%)` }} />
          <div className="absolute top-1/4 -right-24 w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none opacity-20 dark:opacity-45 animate-gradient-drift transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${secondaryColor} 0%, rgba(168, 85, 247, 0) 70%)`, animationDelay: '6s' }} />
          <div className="absolute -bottom-32 left-1/3 w-[600px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20 dark:opacity-35 animate-gradient-drift transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${tertiaryColor} 0%, rgba(6, 182, 212, 0) 70%)`, animationDelay: '12s' }} />
        </>
      )}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.14] dark:opacity-[0.18]"
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px)'
              : 'linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(ellipse 85% 70% at 50% 30%, #000 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 30%, #000 60%, transparent 100%)',
          }}
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />
      {showVignette && (
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(2, 6, 23, 0.55) 100%), linear-gradient(to bottom, transparent 80%, rgba(2, 6, 23, 0.95) 100%)'
              : 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(248, 250, 252, 0.4) 100%), linear-gradient(to bottom, transparent 80%, rgba(255, 255, 255, 0.95) 100%)',
          }}
        />
      )}
      {children && <div className="relative z-10 w-full">{children}</div>}
    </div>
  );
};

export default AmbientBackground;
