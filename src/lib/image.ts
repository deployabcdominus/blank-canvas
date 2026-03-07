export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const compressImage = async (
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise(async (resolve, reject) => {
    try {
      const img = await loadImage(file);
      
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      
      // Draw with image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/jpeg',
        quality
      );

      // Clean up
      URL.revokeObjectURL(img.src);
    } catch (error) {
      reject(error);
    }
  });
};

export const createImageThumbnail = async (
  file: File,
  size: number = 150
): Promise<string> => {
  const img = await loadImage(file);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = size;
  canvas.height = size;
  
  // Calculate crop dimensions for square thumbnail
  const minDimension = Math.min(img.width, img.height);
  const sx = (img.width - minDimension) / 2;
  const sy = (img.height - minDimension) / 2;
  
  ctx.drawImage(
    img, 
    sx, sy, minDimension, minDimension, // source
    0, 0, size, size // destination
  );
  
  URL.revokeObjectURL(img.src);
  return canvas.toDataURL('image/jpeg', 0.8);
};