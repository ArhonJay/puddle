/**
 * WebGL Types for Puddle Pixel Scene
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 extends Vector2 {
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Sprite {
  id: string;
  texture: WebGLTexture | null;
  position: Vector3;
  size: Vector2;
  frame: number;
  frameCount: number;
  frameRate: number;
  lastFrameTime: number;
}

export interface Particle {
  id: string;
  position: Vector3;
  velocity: Vector2;
  size: Vector2;
  color: Color;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

export interface ParticleSystemConfig {
  maxParticles: number;
  emissionRate: number;
  lifetime: number;
  startSize: Vector2;
  endSize: Vector2;
  startColor: Color;
  endColor: Color;
  velocityRange: { min: Vector2; max: Vector2 };
  positionRange: { min: Vector2; max: Vector2 };
}

export interface Layer {
  id: string;
  depth: number; // For parallax (0 = background, 1 = foreground)
  sprites: Sprite[];
  particles: Particle[];
  scrollSpeed: number; // Multiplier for parallax effect
}

export interface SceneConfig {
  canvasWidth: number;
  canvasHeight: number;
  pixelRatio: number;
  backgroundColor: Color;
  layers: Layer[];
}

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  loop: boolean;
}

export type RenderMode = 'webgl' | 'fallback';

export interface RendererStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  sprites: number;
  particles: number;
}
