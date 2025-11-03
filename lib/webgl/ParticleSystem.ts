/**
 * Particle System
 * Manages clouds, birds, and grass particles
 */

import type {
  Particle,
  ParticleSystemConfig,
  Vector2,
  Vector3,
  Color,
} from '@/types/webgl.types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private config: ParticleSystemConfig;
  private lastEmissionTime: number = 0;
  private particleIdCounter: number = 0;

  constructor(config: Partial<ParticleSystemConfig> = {}) {
    this.config = {
      maxParticles: 100,
      emissionRate: 10, // particles per second
      lifetime: 5000, // milliseconds
      startSize: { x: 32, y: 32 },
      endSize: { x: 32, y: 32 },
      startColor: { r: 1, g: 1, b: 1, a: 1 },
      endColor: { r: 1, g: 1, b: 1, a: 0.5 },
      velocityRange: {
        min: { x: -20, y: -10 },
        max: { x: 20, y: 10 },
      },
      positionRange: {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 },
      },
      ...config,
    };
  }

  /**
   * Update all particles
   */
  public update(deltaTime: number): void {
    const currentTime = performance.now();

    // Emit new particles
    this.emit(currentTime, deltaTime);

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update lifetime
      particle.life += deltaTime * 1000;

      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;

      // Update rotation
      particle.rotation += particle.rotationSpeed * deltaTime;

      // Wrap around screen edges (for clouds and birds)
      if (particle.position.x > this.config.positionRange.max.x + 100) {
        particle.position.x = this.config.positionRange.min.x - 100;
      }
      if (particle.position.x < this.config.positionRange.min.x - 100) {
        particle.position.x = this.config.positionRange.max.x + 100;
      }

      // Update color (fade over lifetime)
      const lifePercent = particle.life / particle.maxLife;
      particle.color = this.lerpColor(
        this.config.startColor,
        this.config.endColor,
        lifePercent
      );

      // Update size (optional)
      particle.size = this.lerpVector2(
        this.config.startSize,
        this.config.endSize,
        lifePercent
      );
    }
  }

  /**
   * Emit new particles
   */
  private emit(currentTime: number, deltaTime: number): void {
    if (this.particles.length >= this.config.maxParticles) return;

    const timeSinceLastEmission = currentTime - this.lastEmissionTime;
    const emissionInterval = 1000 / this.config.emissionRate;

    if (timeSinceLastEmission >= emissionInterval) {
      const particlesToEmit = Math.floor(timeSinceLastEmission / emissionInterval);

      for (let i = 0; i < particlesToEmit; i++) {
        if (this.particles.length >= this.config.maxParticles) break;

        this.particles.push(this.createParticle());
      }

      this.lastEmissionTime = currentTime;
    }
  }

  /**
   * Create a new particle
   */
  private createParticle(): Particle {
    const position: Vector3 = {
      x: this.randomRange(
        this.config.positionRange.min.x,
        this.config.positionRange.max.x
      ),
      y: this.randomRange(
        this.config.positionRange.min.y,
        this.config.positionRange.max.y
      ),
      z: 0,
    };

    const velocity: Vector2 = {
      x: this.randomRange(
        this.config.velocityRange.min.x,
        this.config.velocityRange.max.x
      ),
      y: this.randomRange(
        this.config.velocityRange.min.y,
        this.config.velocityRange.max.y
      ),
    };

    return {
      id: `particle-${this.particleIdCounter++}`,
      position,
      velocity,
      size: { ...this.config.startSize },
      color: { ...this.config.startColor },
      life: 0,
      maxLife: this.config.lifetime,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: this.randomRange(-1, 1),
    };
  }

  /**
   * Get all active particles
   */
  public getParticles(): Particle[] {
    return this.particles;
  }

  /**
   * Clear all particles
   */
  public clear(): void {
    this.particles = [];
  }

  /**
   * Set emission rate
   */
  public setEmissionRate(rate: number): void {
    this.config.emissionRate = rate;
  }

  /**
   * Utility: Random range
   */
  private randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Utility: Linear interpolation between colors
   */
  private lerpColor(start: Color, end: Color, t: number): Color {
    return {
      r: start.r + (end.r - start.r) * t,
      g: start.g + (end.g - start.g) * t,
      b: start.b + (end.b - start.b) * t,
      a: start.a + (end.a - start.a) * t,
    };
  }

  /**
   * Utility: Linear interpolation between vectors
   */
  private lerpVector2(start: Vector2, end: Vector2, t: number): Vector2 {
    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    };
  }
}

/**
 * Preset particle system configurations
 */
export const ParticlePresets = {
  /**
   * Cloud particles - slow horizontal drift
   */
  clouds: (canvasWidth: number, canvasHeight: number): Partial<ParticleSystemConfig> => ({
    maxParticles: 15,
    emissionRate: 0.5,
    lifetime: 60000, // 60 seconds
    startSize: { x: 64, y: 32 },
    endSize: { x: 64, y: 32 },
    startColor: { r: 1, g: 1, b: 1, a: 0.8 },
    endColor: { r: 1, g: 1, b: 1, a: 0.6 },
    velocityRange: {
      min: { x: 5, y: -2 },
      max: { x: 15, y: 2 },
    },
    positionRange: {
      min: { x: -100, y: 50 },
      max: { x: canvasWidth, y: canvasHeight * 0.3 },
    },
  }),

  /**
   * Bird particles - flying patterns
   */
  birds: (canvasWidth: number, canvasHeight: number): Partial<ParticleSystemConfig> => ({
    maxParticles: 8,
    emissionRate: 0.2,
    lifetime: 40000, // 40 seconds
    startSize: { x: 16, y: 16 },
    endSize: { x: 16, y: 16 },
    startColor: { r: 0.2, g: 0.2, b: 0.2, a: 1 },
    endColor: { r: 0.2, g: 0.2, b: 0.2, a: 1 },
    velocityRange: {
      min: { x: 30, y: -10 },
      max: { x: 50, y: 10 },
    },
    positionRange: {
      min: { x: -50, y: 80 },
      max: { x: canvasWidth, y: canvasHeight * 0.4 },
    },
  }),

  /**
   * Grass particles - subtle sway
   */
  grass: (canvasWidth: number, canvasHeight: number): Partial<ParticleSystemConfig> => ({
    maxParticles: 50,
    emissionRate: 5,
    lifetime: 10000, // 10 seconds
    startSize: { x: 8, y: 16 },
    endSize: { x: 8, y: 16 },
    startColor: { r: 0.49, g: 0.69, b: 0.49, a: 1 },
    endColor: { r: 0.49, g: 0.69, b: 0.49, a: 0.8 },
    velocityRange: {
      min: { x: -1, y: 0 },
      max: { x: 1, y: 0 },
    },
    positionRange: {
      min: { x: 0, y: canvasHeight * 0.65 },
      max: { x: canvasWidth, y: canvasHeight * 0.7 },
    },
  }),
};
