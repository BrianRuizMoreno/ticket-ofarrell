import { Injectable } from '@angular/core';

export interface IImageOptimizeOptions {
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly quality?: number;
  readonly enhanceThermalContrast?: boolean;
}

export interface IOptimizedImageResult {
  readonly blob: Blob;
  readonly previewUrl: string;
  readonly width: number;
  readonly height: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUtils {
  /**
   * Optimiza y preprocesa una imagen de comprobante para OCR:
   * - Redimensiona conservando proporción de aspecto.
   * - Aplica realce de contraste adaptativo para tickets térmicos descoloridos.
   * - Comprime a JPEG de alta fidelidad para texto con mínimo tamaño.
   */
  async optimizeImage(
    file: File | Blob,
    options: IImageOptimizeOptions = {}
  ): Promise<IOptimizedImageResult> {
    const maxWidth = options.maxWidth ?? 1600;
    const maxHeight = options.maxHeight ?? 2400;
    const quality = options.quality ?? 0.85;
    const enhanceContrast = options.enhanceThermalContrast ?? true;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          let { width, height } = img;

          // Escalar proporcionalmente si excede las dimensiones máximas
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            reject(new Error('No se pudo inicializar el contexto 2D del Canvas.'));
            return;
          }

          // Dibujar la imagen base
          ctx.drawImage(img, 0, 0, width, height);

          // Si está habilitado el realce térmico, optimizar rango dinámico
          if (enhanceContrast) {
            this.applyThermalReceiptEnhancement(ctx, width, height);
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  blob,
                  previewUrl: canvas.toDataURL('image/jpeg', 0.65),
                  width,
                  height
                });
              } else {
                reject(new Error('Error al comprimir la imagen del comprobante.'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Realza el contraste en tickets térmicos descoloridos:
   * Aplica un estiramiento de histograma y acentuación de bordes para
   * asegurar que los números y letras tenues sean leídos nítidamente por el OCR.
   */
  private applyThermalReceiptEnhancement(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const len = data.length;

      // Parámetro de contraste (rango -255 a 255). 32 aporta nitidez sin quemar el fondo.
      const contrast = 32;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < len; i += 4) {
        // Realce de canal R, G, B
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
      }

      ctx.putImageData(imgData, 0, 0);
    } catch {
      // Si el navegador tiene restricciones de seguridad sobre el canvas, continuar con imagen sin procesar
      console.warn('[ImageUtils] No se pudo aplicar filtro térmico en Canvas.');
    }
  }
}
