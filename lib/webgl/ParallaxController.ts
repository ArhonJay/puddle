/**
 * Parallax Controller
 * Manages layer-based parallax scrolling effect
 */

import type { Layer } from '@/types/webgl.types';
import { Easing } from './SpriteAnimator';

export interface ParallaxLayer {
  id: string;
  depth: number; // 0 = far background, 1 = foreground
  scrollSpeed: number; // Parallax multiplier
  offset: number; // Current scroll offset
}

export class ParallaxController {
  private layers: Map<string, ParallaxLayer> = new Map();
  private scrollPosition: number = 0;
  private targetScrollPosition: number = 0;
  private smoothingFactor: number = 0.1;
  private isSmoothing: boolean = true;

  constructor(smoothingFactor: number = 0.1) {
    this.smoothingFactor = smoothingFactor;
  }

  /**
   * Add a parallax layer
   */
  public addLayer(layer: ParallaxLayer): void {
    this.layers.set(layer.id, layer);
  }

  /**
   * Remove a parallax layer
   */
  public removeLayer(layerId: string): void {
    this.layers.delete(layerId);
  }

  /**
   * Get a layer by ID
   */
  public getLayer(layerId: string): ParallaxLayer | undefined {
    return this.layers.get(layerId);
  }

  /**
   * Get all layers sorted by depth
   */
  public getLayers(): ParallaxLayer[] {
    return Array.from(this.layers.values()).sort((a, b) => a.depth - b.depth);
  }

  /**
   * Set scroll position (usually from window scroll)
   */
  public setScrollPosition(position: number): void {
    this.targetScrollPosition = position;
  }

  /**
   * Update parallax offsets (call every frame)
   */
  public update(deltaTime: number): void {
    // Smooth scrolling
    if (this.isSmoothing) {
      const diff = this.targetScrollPosition - this.scrollPosition;
      this.scrollPosition += diff * this.smoothingFactor;
    } else {
      this.scrollPosition = this.targetScrollPosition;
    }

    // Update layer offsets based on scroll position and speed
    for (const layer of this.layers.values()) {
      layer.offset = this.scrollPosition * layer.scrollSpeed;
    }
  }

  /**
   * Get scroll offset for a specific layer
   */
  public getLayerOffset(layerId: string): number {
    const layer = this.layers.get(layerId);
    return layer ? layer.offset : 0;
  }

  /**
   * Enable/disable smooth scrolling
   */
  public setSmoothing(enabled: boolean): void {
    this.isSmoothing = enabled;
  }

  /**
   * Set smoothing factor (0 = instant, 1 = very slow)
   */
  public setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.max(0, Math.min(1, factor));
  }

  /**
   * Get current scroll position
   */
  public getScrollPosition(): number {
    return this.scrollPosition;
  }

  /**
   * Reset all layer offsets
   */
  public reset(): void {
    this.scrollPosition = 0;
    this.targetScrollPosition = 0;
    for (const layer of this.layers.values()) {
      layer.offset = 0;
    }
  }

  /**
   * Create default parallax layers for RPG scene
   */
  public static createDefaultLayers(): ParallaxLayer[] {
    return [
      {
        id: 'sky',
        depth: 0,
        scrollSpeed: 0, // Sky doesn't move
        offset: 0,
      },
      {
        id: 'clouds-far',
        depth: 0.1,
        scrollSpeed: 0.1, // Slow parallax
        offset: 0,
      },
      {
        id: 'mountains-far',
        depth: 0.2,
        scrollSpeed: 0.2,
        offset: 0,
      },
      {
        id: 'clouds-near',
        depth: 0.3,
        scrollSpeed: 0.3,
        offset: 0,
      },
      {
        id: 'mountains-near',
        depth: 0.4,
        scrollSpeed: 0.4,
        offset: 0,
      },
      {
        id: 'trees-far',
        depth: 0.5,
        scrollSpeed: 0.5,
        offset: 0,
      },
      {
        id: 'ground',
        depth: 0.7,
        scrollSpeed: 0.7,
        offset: 0,
      },
      {
        id: 'trees-near',
        depth: 0.8,
        scrollSpeed: 0.8,
        offset: 0,
      },
      {
        id: 'grass',
        depth: 0.85,
        scrollSpeed: 0.85,
        offset: 0,
      },
      {
        id: 'mascot',
        depth: 0.9,
        scrollSpeed: 0.9, // Mascot moves with foreground
        offset: 0,
      },
      {
        id: 'birds',
        depth: 0.6,
        scrollSpeed: 0.6,
        offset: 0,
      },
    ];
  }
}

/**
 * Calculate parallax offset with easing
 */
export function calculateParallaxOffset(
  scrollPosition: number,
  depth: number,
  easing: keyof typeof Easing = 'linear'
): number {
  const easingFunc = Easing[easing] || Easing.linear;
  return scrollPosition * easingFunc(depth);
}

/**
 * Create parallax effect for vertical scrolling
 */
export function createVerticalParallax(
  scrollY: number,
  viewportHeight: number,
  layerDepth: number
): number {
  // Normalize scroll position (0 to 1)
  const normalizedScroll = Math.max(0, Math.min(1, scrollY / viewportHeight));
  
  // Apply depth-based offset
  return normalizedScroll * layerDepth * 100;
}

/**
 * Create parallax effect for horizontal scrolling
 */
export function createHorizontalParallax(
  scrollX: number,
  viewportWidth: number,
  layerDepth: number
): number {
  const normalizedScroll = Math.max(0, Math.min(1, scrollX / viewportWidth));
  return normalizedScroll * layerDepth * 100;
}
