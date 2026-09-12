import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export type AmbientBackgroundVariant = 'constellation' | 'neural-mesh' | 'cyber-grid' | 'ambient-flow';

export interface AmbientBackgroundProps {
  /**
   * Visual preset variant:
   * - 'constellation': Interconnected glowing tech nodes with cyber data pulses (default)
   * - 'neural-mesh': Denser cybernetic neural synapses with gradient links
   * - 'cyber-grid': Orthogonal grid nodes with subtle undulating wave motion
   * - 'ambient-flow': Smooth drifting organic particles with soft light trails
   */
  variant?: AmbientBackgroundVariant;
  /**
   * Density of particles/nodes: 'low' | 'medium' | 'high'
   */
  density?: 'low' | 'medium' | 'high';
  /**
   * Custom particle count override (ignores density if provided)
   */
  particleCount?: number;
  /**
   * Animation speed multiplier (default: 1.0)
   */
  speed?: number;
  /**
   * Enable mouse/touch interaction (subtle magnetic repelling & link tethering)
   */
  interactive?: boolean;
  /**
   * Interaction radius in pixels (default: 150)
   */
  interactiveRadius?: number;
  /**
   * Primary glowing accent color override
   */
  accentColor?: string;
  /**
   * Secondary glowing accent color override
   */
  secondaryColor?: string;
  /**
   * Tertiary glowing accent color override
   */
  tertiaryColor?: string;
  /**
   * Show glowing ambient nebula orbs behind the canvas
   */
  showNebula?: boolean;
  /**
   * Show subtle cyber tech grid overlay lines
   */
  showGrid?: boolean;
  /**
   * Vignette overlay to guarantee maximum foreground text contrast
   */
  showVignette?: boolean;
  /**
   * Additional container CSS classes
   */
  className?: string;
  /**
   * Optional child elements to wrap inside the ambient container
   */
  children?: React.ReactNode;
}

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  layer: number; // 0: background, 1: midground, 2: foreground
}

interface DataPulse {
  fromIndex: number;
  toIndex: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
  size: number;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'constellation',
  density = 'medium',
  particleCount: customParticleCount,
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
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  const [isVisible, setIsVisible] = useState(true);

  // Dynamic Theme-Aware Palette
  const accentColor = customAccent || (isDark ? '#6366f1' : '#4f46e5'); // Indigo
  const secondaryColor = customSecondary || (isDark ? '#a855f7' : '#9333ea'); // Purple
  const tertiaryColor = customTertiary || (isDark ? '#06b6d4' : '#0284c7'); // Cyan / Sky

  // Compute total particles based on variant and density
  const particleCount = useMemo(() => {
    if (customParticleCount && customParticleCount > 0) return customParticleCount;
    const densityMap: Record<AmbientBackgroundVariant, Record<'low' | 'medium' | 'high', number>> = {
      constellation: { low: 35, medium: 60, high: 95 },
      'neural-mesh': { low: 45, medium: 75, high: 120 },
      'cyber-grid': { low: 30, medium: 50, high: 80 },
      'ambient-flow': { low: 40, medium: 70, high: 110 },
    };
    return densityMap[variant][density];
  }, [variant, density, customParticleCount]);

  // Handle visibility with IntersectionObserver to save CPU/GPU cycles when offscreen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Main Canvas Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !isVisible) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Palette list for nodes
    const colors = [accentColor, secondaryColor, tertiaryColor];

    // Initialize particles and traveling pulses
    let particles: Particle[] = [];
    let pulses: DataPulse[] = [];
    let lastPulseTime = 0;

    const initDimensions = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 320);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      particles = [];
      pulses = [];

      const count = particleCount;

      if (variant === 'cyber-grid') {
        const cols = Math.ceil(Math.sqrt((count * width) / height));
        const rows = Math.ceil(count / cols);
        const colGap = width / (cols + 1);
        const rowGap = height / (rows + 1);

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (particles.length >= count) break;
            const baseX = (c + 1) * colGap + (Math.random() - 0.5) * 16;
            const baseY = (r + 1) * rowGap + (Math.random() - 0.5) * 16;
            const layer = Math.random() > 0.6 ? 2 : Math.random() > 0.3 ? 1 : 0;
            const color = colors[Math.floor(Math.random() * colors.length)];

            particles.push({
              x: baseX,
              y: baseY,
              baseX,
              baseY,
              vx: (Math.random() - 0.5) * 0.25 * speed,
              vy: (Math.random() - 0.5) * 0.25 * speed,
              radius: layer === 2 ? 2.5 : layer === 1 ? 1.8 : 1.2,
              baseRadius: layer === 2 ? 2.5 : layer === 1 ? 1.8 : 1.2,
              color,
              glowColor: color,
              alpha: isDark
                ? layer === 2 ? 0.85 : layer === 1 ? 0.6 : 0.35
                : layer === 2 ? 0.95 : layer === 1 ? 0.75 : 0.5,
              pulseSpeed: 0.02 + Math.random() * 0.03,
              pulsePhase: Math.random() * Math.PI * 2,
              layer,
            });
          }
        }
      } else {
        for (let i = 0; i < count; i++) {
          const layer = Math.random() > 0.7 ? 2 : Math.random() > 0.35 ? 1 : 0;
          const x = Math.random() * width;
          const y = Math.random() * height;
          const angle = Math.random() * Math.PI * 2;
          const velocity = (layer === 2 ? 0.35 : layer === 1 ? 0.22 : 0.1) * speed;
          const color = colors[Math.floor(Math.random() * colors.length)];

          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            radius: layer === 2 ? 2.5 : layer === 1 ? 1.8 : 1.2,
            baseRadius: layer === 2 ? 2.5 : layer === 1 ? 1.8 : 1.2,
            color,
            glowColor: color,
            alpha: isDark
              ? layer === 2 ? 0.85 : layer === 1 ? 0.6 : 0.35
              : layer === 2 ? 0.95 : layer === 1 ? 0.75 : 0.5,
            pulseSpeed: 0.02 + Math.random() * 0.03,
            pulsePhase: Math.random() * Math.PI * 2,
            layer,
          });
        }
      }
    };

    initDimensions();
    initParticles();

    // Resize handler
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        initDimensions();
        initParticles();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    // Mouse & Touch tracking relative to container or window
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const targetEl = container.parentElement || container;
    targetEl.addEventListener('pointermove', handlePointerMove as any);
    targetEl.addEventListener('pointerleave', handlePointerLeave as any);

    const maxLinkDist = variant === 'neural-mesh' ? 140 : variant === 'cyber-grid' ? 120 : 130;
    const maxLinkDistSq = maxLinkDist * maxLinkDist;
    const mouseRadiusSq = interactiveRadius * interactiveRadius;

    let lastTime = performance.now();

    // Render loop
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      // Spawn periodic cyber data pulses along lines
      if (variant === 'constellation' || variant === 'neural-mesh') {
        if (time - lastPulseTime > 900 && particles.length > 2) {
          lastPulseTime = time;
          const fromIdx = Math.floor(Math.random() * particles.length);
          let bestNeighbor = -1;
          let bestDist = Infinity;
          for (let j = 0; j < particles.length; j++) {
            if (j === fromIdx) continue;
            const dx = particles[fromIdx].x - particles[j].x;
            const dy = particles[fromIdx].y - particles[j].y;
            const dSq = dx * dx + dy * dy;
            if (dSq < maxLinkDistSq && dSq < bestDist) {
              bestDist = dSq;
              bestNeighbor = j;
            }
          }
          if (bestNeighbor !== -1 && pulses.length < 8) {
            pulses.push({
              fromIndex: fromIdx,
              toIndex: bestNeighbor,
              progress: 0,
              speed: 0.7 + Math.random() * 0.5,
              color: colors[Math.floor(Math.random() * colors.length)],
              size: 2.2,
            });
          }
        }
      }

      // Update particle positions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.pulsePhase += p.pulseSpeed;
        const pulseFactor = 0.88 + Math.sin(p.pulsePhase) * 0.2;

        if (variant === 'cyber-grid') {
          p.baseX += p.vx * 60 * dt;
          p.baseY += p.vy * 60 * dt;
          if (p.baseX < 0) p.baseX = width;
          if (p.baseX > width) p.baseX = 0;
          if (p.baseY < 0) p.baseY = height;
          if (p.baseY > height) p.baseY = 0;

          const waveX = Math.sin(time * 0.0015 + p.baseY * 0.02) * 5;
          const waveY = Math.cos(time * 0.0015 + p.baseX * 0.02) * 5;
          p.x = p.baseX + waveX;
          p.y = p.baseY + waveY;
        } else {
          p.x += p.vx * 60 * dt;
          p.y += p.vy * 60 * dt;

          const margin = 20;
          if (p.x < -margin) p.x = width + margin;
          if (p.x > width + margin) p.x = -margin;
          if (p.y < -margin) p.y = height + margin;
          if (p.y > height + margin) p.y = -margin;
        }

        // Subtle spring repulsion from mouse
        if (interactive && mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < mouseRadiusSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / interactiveRadius) * 18 * (p.layer + 1) * 0.4;
            p.x -= (dx / dist) * force * dt * 2.0;
            p.y -= (dy / dist) * force * dt * 2.0;
          }
        }

        p.radius = p.baseRadius * pulseFactor;
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let connections = 0;
        const maxConnsPerNode = variant === 'neural-mesh' ? 4 : 3;

        for (let j = i + 1; j < particles.length; j++) {
          if (connections >= maxConnsPerNode) break;

          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxLinkDistSq) {
            connections++;
            const dist = Math.sqrt(distSq);
            const normDist = 1 - dist / maxLinkDist;
            const lineAlphaMultiplier = isDark ? 0.22 : 0.32;
            const lineAlpha = normDist * lineAlphaMultiplier * Math.min(p1.alpha, p2.alpha);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.color);
            grad.addColorStop(1, p2.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = variant === 'neural-mesh' ? 0.9 : 0.75;
            ctx.stroke();
          }
        }

        // Connect node to mouse cursor if within range
        if (interactive && mouse.active) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mDistSq = mdx * mdx + mdy * mdy;

          if (mDistSq < mouseRadiusSq) {
            const mDist = Math.sqrt(mDistSq);
            const mAlpha = (1 - mDist / interactiveRadius) * (isDark ? 0.25 : 0.35) * p1.alpha;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = tertiaryColor;
            ctx.globalAlpha = mAlpha;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update and draw traveling data pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed * dt;

        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const pFrom = particles[pulse.fromIndex];
        const pTo = particles[pulse.toIndex];

        if (!pFrom || !pTo) {
          pulses.splice(i, 1);
          continue;
        }

        const currX = pFrom.x + (pTo.x - pFrom.x) * pulse.progress;
        const currY = pFrom.y + (pTo.y - pFrom.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(currX, currY, pulse.size, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.globalAlpha = isDark ? 0.9 : 0.95;
        ctx.fill();
      }

      // Draw particle nodes with soft glow
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.layer >= 1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          const glowGrad = ctx.createRadialGradient(
            p.x,
            p.y,
            p.radius * 0.2,
            p.x,
            p.y,
            p.radius * 3
          );
          glowGrad.addColorStop(0, p.glowColor);
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.globalAlpha = p.alpha * (isDark ? 0.3 : 0.25);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      targetEl.removeEventListener('pointermove', handlePointerMove as any);
      targetEl.removeEventListener('pointerleave', handlePointerLeave as any);
    };
  }, [
    isVisible,
    particleCount,
    speed,
    interactive,
    interactiveRadius,
    accentColor,
    secondaryColor,
    tertiaryColor,
    variant,
    isDark,
  ]);

  const containerClasses = children
    ? `relative w-full overflow-hidden ${className}`
    : `absolute inset-0 w-full h-full overflow-hidden pointer-events-none ${className}`;

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* 1. Deep Space or Crisp Tech Light Base Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-gray-950 pointer-events-none transition-colors duration-300" />

      {/* 2. Ambient Radiant Nebula Glowing Orbs */}
      {showNebula && (
        <>
          <div
            className="absolute -top-24 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-25 dark:opacity-50 animate-gradient-drift transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, ${accentColor} 0%, rgba(99, 102, 241, 0) 70%)`,
            }}
          />
          <div
            className="absolute top-1/4 -right-24 w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none opacity-20 dark:opacity-45 animate-gradient-drift transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, ${secondaryColor} 0%, rgba(168, 85, 247, 0) 70%)`,
              animationDelay: '6s',
            }}
          />
          <div
            className="absolute -bottom-32 left-1/3 w-[600px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-20 dark:opacity-35 animate-gradient-drift transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, ${tertiaryColor} 0%, rgba(6, 182, 212, 0) 70%)`,
              animationDelay: '12s',
            }}
          />
        </>
      )}

      {/* 3. Subtle Cyber Tech Grid Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.14] dark:opacity-[0.18]"
          style={{
            backgroundImage: isDark
              ? `
                linear-gradient(to right, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.12) 1px, transparent 1px)
              `
              : `
                linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
              `,
            backgroundSize: '4rem 4rem',
            maskImage:
              'radial-gradient(ellipse 85% 70% at 50% 30%, #000 60%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 85% 70% at 50% 30%, #000 60%, transparent 100%)',
          }}
        />
      )}

      {/* 4. Canvas Kinetic Interactive Particle Mesh */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      />

      {/* 5. Smooth Vignette & Bottom Blending Gradient Overlay */}
      {showVignette && (
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background: isDark
              ? `
                radial-gradient(circle at 50% 50%, transparent 40%, rgba(2, 6, 23, 0.55) 100%),
                linear-gradient(to bottom, transparent 80%, rgba(2, 6, 23, 0.95) 100%)
              `
              : `
                radial-gradient(circle at 50% 50%, transparent 50%, rgba(248, 250, 252, 0.4) 100%),
                linear-gradient(to bottom, transparent 80%, rgba(255, 255, 255, 0.95) 100%)
              `,
          }}
        />
      )}

      {/* 6. Foreground Content (if used as a wrapper) */}
      {children && <div className="relative z-10 w-full">{children}</div>}
    </div>
  );
};

export default AmbientBackground;
