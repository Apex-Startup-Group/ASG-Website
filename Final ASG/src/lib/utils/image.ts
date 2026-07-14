/**
 * Helper to create an HTML Image element from a URL string
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Prevent CORS taint
    image.src = url;
  });

/**
 * Interface representing the cropped area in pixels
 */
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crops, resizes, and converts an image to WebP format using HTML5 Canvas.
 * Strips EXIF metadata because the canvas draws raw pixel data.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  maxWidth: number = 1200
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Calculate target dimensions, scaling down if the width exceeds maxWidth
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > maxWidth) {
    const scale = maxWidth / targetWidth;
    targetWidth = maxWidth;
    targetHeight = Math.round(targetHeight * scale);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw the cropped portion from the source image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Export as WebP blob with 85% compression quality
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/webp',
      0.85
    );
  });
}
