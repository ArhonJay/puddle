/**
 * WebGL Module Barrel Export
 * Central export point for all WebGL rendering components
 */

export { PixelSceneRenderer } from './PixelSceneRenderer';
export { ParticleSystem, ParticlePresets } from './ParticleSystem';
export { SpriteAnimator, createColoredSprite, Easing } from './SpriteAnimator';
export {
  ParallaxController,
  calculateParallaxOffset,
  createVerticalParallax,
  createHorizontalParallax,
} from './ParallaxController';

export type { SpriteSheetConfig } from './SpriteAnimator';
export type { ParallaxLayer } from './ParallaxController';
