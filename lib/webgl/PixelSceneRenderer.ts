/**
 * Pixel Scene Renderer
 * Core WebGL renderer for 2D pixel art RPG scene
 */

import type {
  SceneConfig,
  Layer,
  Sprite,
  Particle,
  Color,
  RendererStats,
  RenderMode,
} from '@/types/webgl.types';

export class PixelSceneRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private renderMode: RenderMode = 'webgl';
  
  // Buffers
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  
  // Shader locations
  private positionLocation: number = -1;
  private texCoordLocation: number = -1;
  private matrixLocation: WebGLUniformLocation | null = null;
  private textureLocation: WebGLUniformLocation | null = null;
  private colorLocation: WebGLUniformLocation | null = null;
  
  // Scene state
  private config: SceneConfig;
  private layers: Layer[] = [];
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private stats: RendererStats = {
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    sprites: 0,
    particles: 0,
  };

  // Scroll offset for parallax
  private scrollOffset: number = 0;

  constructor(canvas: HTMLCanvasElement, config: Partial<SceneConfig> = {}) {
    this.canvas = canvas;
    this.config = {
      canvasWidth: canvas.width || 800,
      canvasHeight: canvas.height || 600,
      pixelRatio: window.devicePixelRatio || 1,
      backgroundColor: { r: 0.53, g: 0.81, b: 0.92, a: 1.0 }, // Sky blue
      layers: [],
      ...config,
    };

    this.initialize();
  }

  /**
   * Initialize WebGL context and shaders
   */
  private initialize(): boolean {
    try {
      // Get WebGL context
      this.gl = this.canvas.getContext('webgl', {
        alpha: false,
        antialias: false, // Keep pixels crisp
        depth: false,
        premultipliedAlpha: false,
      });

      if (!this.gl) {
        console.warn('WebGL not supported, falling back to canvas 2D');
        this.renderMode = 'fallback';
        return false;
      }

      // Setup WebGL state
      this.gl.disable(this.gl.DEPTH_TEST);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      
      // Pixel-perfect rendering
      this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

      // Create shader program
      if (!this.createShaderProgram()) {
        this.renderMode = 'fallback';
        return false;
      }

      // Create buffers
      this.createBuffers();

      // Resize canvas to proper dimensions
      this.resize();

      this.renderMode = 'webgl';
      return true;
    } catch (error) {
      console.error('Failed to initialize WebGL:', error);
      this.renderMode = 'fallback';
      return false;
    }
  }

  /**
   * Create shader program
   */
  private createShaderProgram(): boolean {
    if (!this.gl) return false;

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      
      uniform mat3 u_matrix;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;
        gl_Position = vec4(position, 0, 1);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      
      uniform sampler2D u_texture;
      uniform vec4 u_color;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec4 texColor = texture2D(u_texture, v_texCoord);
        gl_FragColor = texColor * u_color;
      }
    `;

    // Create shaders
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      return false;
    }

    // Create program
    this.program = this.gl.createProgram();
    if (!this.program) return false;

    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Failed to link program:', this.gl.getProgramInfoLog(this.program));
      return false;
    }

    // Get attribute and uniform locations
    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
    this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
    this.textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');
    this.colorLocation = this.gl.getUniformLocation(this.program, 'u_color');

    return true;
  }

  /**
   * Create a shader
   */
  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Create vertex buffers
   */
  private createBuffers(): void {
    if (!this.gl) return;

    // Position buffer (quad)
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    const positions = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    // Texture coordinate buffer
    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
  }

  /**
   * Resize canvas
   */
  public resize(): void {
    if (!this.gl) return;

    const width = this.canvas.clientWidth * this.config.pixelRatio;
    const height = this.canvas.clientHeight * this.config.pixelRatio;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.config.canvasWidth = width;
      this.config.canvasHeight = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  /**
   * Start rendering loop
   */
  public start(): void {
    if (this.animationFrameId !== null) return;
    
    this.lastFrameTime = performance.now();
    this.render(this.lastFrameTime);
  }

  /**
   * Stop rendering loop
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main render loop
   */
  private render = (currentTime: number): void => {
    if (!this.gl || !this.program) return;

    // Calculate delta time and FPS
    const deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    this.stats.fps = Math.round(1 / deltaTime);

    // Clear canvas
    const bg = this.config.backgroundColor;
    this.gl.clearColor(bg.r, bg.g, bg.b, bg.a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Use shader program
    this.gl.useProgram(this.program);

    // Reset stats
    this.stats.drawCalls = 0;
    this.stats.triangles = 0;
    this.stats.sprites = 0;
    this.stats.particles = 0;

    // Render each layer (back to front)
    const sortedLayers = [...this.layers].sort((a, b) => a.depth - b.depth);
    
    for (const layer of sortedLayers) {
      this.renderLayer(layer, deltaTime);
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.render);
  };

  /**
   * Render a single layer
   */
  private renderLayer(layer: Layer, deltaTime: number): void {
    // Calculate parallax offset
    const parallaxOffset = this.scrollOffset * layer.scrollSpeed;

    // Render sprites
    for (const sprite of layer.sprites) {
      this.renderSprite(sprite, parallaxOffset);
      this.stats.sprites++;
    }

    // Render particles
    for (const particle of layer.particles) {
      this.renderParticle(particle, parallaxOffset);
      this.stats.particles++;
    }
  }

  /**
   * Render a sprite (placeholder - will be implemented in Step 7)
   */
  private renderSprite(sprite: Sprite, parallaxOffset: number): void {
    // Implementation in Step 7
    this.stats.drawCalls++;
    this.stats.triangles += 2;
  }

  /**
   * Render a particle (placeholder - will be implemented in Step 6)
   */
  private renderParticle(particle: Particle, parallaxOffset: number): void {
    // Implementation in Step 6
    this.stats.drawCalls++;
    this.stats.triangles += 2;
  }

  /**
   * Update scroll offset for parallax
   */
  public setScrollOffset(offset: number): void {
    this.scrollOffset = offset;
  }

  /**
   * Add a layer
   */
  public addLayer(layer: Layer): void {
    this.layers.push(layer);
  }

  /**
   * Remove a layer
   */
  public removeLayer(layerId: string): void {
    this.layers = this.layers.filter((layer) => layer.id !== layerId);
  }

  /**
   * Get renderer stats
   */
  public getStats(): RendererStats {
    return { ...this.stats };
  }

  /**
   * Get render mode
   */
  public getRenderMode(): RenderMode {
    return this.renderMode;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stop();

    if (this.gl) {
      // Delete buffers
      if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
      if (this.texCoordBuffer) this.gl.deleteBuffer(this.texCoordBuffer);

      // Delete program
      if (this.program) this.gl.deleteProgram(this.program);

      this.gl = null;
    }

    this.layers = [];
  }
}
