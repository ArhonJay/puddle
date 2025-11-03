/**
 * Simple Canvas Scene Renderer - Just loads and displays an image
 */
export class CanvasSceneRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private sceneImage: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.resizeCanvas();
  }

  /**
   * Load the scene image
   */
  public loadSceneImage(src: string = '/images/whole_scenery.png'): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sceneImage = img;
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Start rendering
   */
  public start(): void {
    if (this.animationFrameId === null) {
      this.render();
    }
  }

  /**
   * Stop rendering
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resize canvas to match container
   */
  public resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  /**
   * Main render loop - just draw the image
   */
  private render = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.sceneImage && this.sceneImage.complete) {
      // Scale image to cover canvas while maintaining aspect ratio
      const canvasRatio = this.canvas.width / this.canvas.height;
      const imageRatio = this.sceneImage.width / this.sceneImage.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (canvasRatio > imageRatio) {
        // Canvas is wider than image
        drawWidth = this.canvas.width;
        drawHeight = this.canvas.width / imageRatio;
        offsetX = 0;
        offsetY = (this.canvas.height - drawHeight) / 2;
      } else {
        // Canvas is taller than image
        drawWidth = this.canvas.height * imageRatio;
        drawHeight = this.canvas.height;
        offsetX = (this.canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      this.ctx.drawImage(
        this.sceneImage,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
    } else {
      // Show loading text
      this.ctx.fillStyle = '#4A90C8';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '24px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        'Loading scene...',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stop();
    this.sceneImage = null;
  }
}
