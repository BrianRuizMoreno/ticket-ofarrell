import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImageUtils {

    async optimizeImage(file: File, maxWidth = 1280, quality = 0.8): Promise<{ blob: Blob, previewUrl: string }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('No se pudo obtener contexto 2D del canvas'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve({
                                    blob,
                                    previewUrl: canvas.toDataURL('image/jpeg', 0.6)
                                });
                            } else {
                                reject(new Error('Error al comprimir imagen'));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };

                img.onerror = (error) => reject(error);
            };

            reader.onerror = (error) => reject(error);
        });
    }
}
