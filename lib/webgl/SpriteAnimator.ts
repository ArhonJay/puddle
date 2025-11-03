/**
 * Sprite Animator
 * Handles sprite sheet animation for pixel art
 */

import type { Sprite, Vector2, Vector3 } from '@/types/webgl.types';

export interface SpriteSheetConfig {
  imagePath: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number; // frames per second
}

export class SpriteAnimator {
  private sprites: Map<string, Sprite> = new Map();
  private spriteSheets: Map<string, HTMLImageElement> = new Map();
  private gl: WebGLRenderingContext | null = null;

  constructor(gl: WebGLRenderingContext | null = null) {
    this.gl = gl;
  }

  /**
   * Load a sprite sheet
   */
  public async loadSpriteSheet(
    id: string,
    config: SpriteSheetConfig
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.spriteSheets.set(id, img);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load sprite sheet: ${config.imagePath}`));
      };

      // For pixel art, disable image smoothing
      img.style.imageRendering = 'pixelated';
      img.src = config.imagePath;
    });
  }

  /**
   * Create a sprite from a loaded sprite sheet
   */
  public createSprite(
    spriteId: string,
    spriteSheetId: string,
    position: Vector3,
    size: Vector2,
    frameCount: number = 1,
    frameRate: number = 10
  ): Sprite | null {
    const spriteSheet = this.spriteSheets.get(spriteSheetId);
    if (!spriteSheet) {
      console.error(`Sprite sheet not found: ${spriteSheetId}`);
      return null;
    }

    const sprite: Sprite = {
      id: spriteId,
      texture: this.createTexture(spriteSheet),
      position,
      size,
      frame: 0,
      frameCount,
      frameRate,
      lastFrameTime: performance.now(),
    };

    this.sprites.set(spriteId, sprite);
    return sprite;
  }

  /**
   * Create WebGL texture from image
   */
  private createTexture(image: HTMLImageElement): WebGLTexture | null {
    if (!this.gl) return null;

    const texture = this.gl.createTexture();
    if (!texture) return null;

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Upload image
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );

    // Pixel art settings - no filtering
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    return texture;
  }

  /**
   * Update sprite animations
   */
  public update(deltaTime: number): void {
    const currentTime = performance.now();

    for (const sprite of this.sprites.values()) {
      if (sprite.frameCount <= 1) continue;

      const frameDuration = 1000 / sprite.frameRate;
      const timeSinceLastFrame = currentTime - sprite.lastFrameTime;

      if (timeSinceLastFrame >= frameDuration) {
        sprite.frame = (sprite.frame + 1) % sprite.frameCount;
        sprite.lastFrameTime = currentTime;
      }
    }
  }

  /**
   * Get a sprite by ID
   */
  public getSprite(id: string): Sprite | undefined {
    return this.sprites.get(id);
  }

  /**
   * Get all sprites
   */
  public getAllSprites(): Sprite[] {
    return Array.from(this.sprites.values());
  }

  /**
   * Remove a sprite
   */
  public removeSprite(id: string): void {
    const sprite = this.sprites.get(id);
    if (sprite && sprite.texture && this.gl) {
      this.gl.deleteTexture(sprite.texture);
    }
    this.sprites.delete(id);
  }

  /**
   * Get current frame for a sprite
   */
  public getCurrentFrame(sprite: Sprite): number {
    return sprite.frame;
  }

  /**
   * Set sprite frame manually
   */
  public setFrame(spriteId: string, frame: number): void {
    const sprite = this.sprites.get(spriteId);
    if (sprite) {
      sprite.frame = Math.max(0, Math.min(frame, sprite.frameCount - 1));
    }
  }

  /**
   * Create animated tree sprite (waving effect)
   */
  public createTreeSprite(
    id: string,
    position: Vector3,
    waveAmplitude: number = 2,
    waveFrequency: number = 1
  ): Sprite | null {
    // For now, create a simple colored sprite
    // In production, you'd load an actual tree sprite sheet
    const sprite = this.createSprite(
      id,
      'tree', // sprite sheet ID
      position,
      { x: 32, y: 48 }, // tree size
      4, // 4 frames for waving animation
      4 // 4 fps for subtle wave
    );

    return sprite;
  }

  /**
   * Create mascot sprite (idle animation)
   */
  public createMascotSprite(id: string, position: Vector3): Sprite | null {
    const sprite = this.createSprite(
      id,
      'mascot',
      position,
      { x: 48, y: 48 },
      3, // 3 frame idle animation
      6 // 6 fps
    );

    return sprite;
  }

  /**
   * Cleanup all sprites and textures
   */
  public destroy(): void {
    if (this.gl) {
      for (const sprite of this.sprites.values()) {
        if (sprite.texture) {
          this.gl.deleteTexture(sprite.texture);
        }
      }
    }

    this.sprites.clear();
    this.spriteSheets.clear();
  }
}

/**
 * Helper function to generate simple colored sprite (fallback)
 */
export function createColoredSprite(
  width: number,
  height: number,
  color: string
): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

/**
 * Easing functions for smooth animations
 */
export const Easing = {
  linear: (t: number): number => t,
  
  easeIn: (t: number): number => t * t,
  
  easeOut: (t: number): number => t * (2 - t),
  
  easeInOut: (t: number): number => 
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t: number): number => t * t * t,
  
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  
  bounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
};
