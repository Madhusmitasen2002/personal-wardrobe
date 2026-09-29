/**
 * High-performance background removal utility
 * Uses @imgly/background-removal with on-demand dynamic import
 * and canvas-based intelligent fallback.
 */

export async function removeBackgroundFromFile(imageFile, onProgress = () => {}) {
  try {
    onProgress('Loading AI cutout model...');
    const { default: removeBackground } = await import('@imgly/background-removal');

    onProgress('Removing background clutter...');
    const imageBlob = await removeBackground(imageFile, {
      progress: (key, current, total) => {
        if (total > 0) {
          const pct = Math.round((current / total) * 100);
          onProgress(`Processing image: ${pct}%`);
        }
      },
    });

    const cleanFile = new File([imageBlob], imageFile.name.replace(/\.[^.]+$/, '') + '-cutout.png', {
      type: 'image/png',
    });

    return {
      file: cleanFile,
      previewUrl: URL.createObjectURL(imageBlob),
      success: true,
    };
  } catch (err) {
    console.warn('AI background removal had an issue, falling back to smart canvas contrast filter:', err);

    // Canvas fallback: smart edge-based chroma/luminance transparency
    try {
      const fallbackBlob = await canvasSmartCutout(imageFile);
      const cleanFile = new File([fallbackBlob], imageFile.name.replace(/\.[^.]+$/, '') + '-cutout.png', {
        type: 'image/png',
      });
      return {
        file: cleanFile,
        previewUrl: URL.createObjectURL(fallbackBlob),
        success: true,
      };
    } catch (fallbackErr) {
      console.error('All background removal attempts failed, using original image:', fallbackErr);
      return {
        file: imageFile,
        previewUrl: URL.createObjectURL(imageFile),
        success: false,
        error: err.message,
      };
    }
  }
}

function canvasSmartCutout(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample 4 corner pixels to determine background tone
      const corners = [
        [0, 0],
        [canvas.width - 1, 0],
        [0, canvas.height - 1],
        [canvas.width - 1, canvas.height - 1],
      ];

      let bgR = 0, bgG = 0, bgB = 0;
      corners.forEach(([x, y]) => {
        const idx = (y * canvas.width + x) * 4;
        bgR += data[idx];
        bgG += data[idx + 1];
        bgB += data[idx + 2];
      });
      bgR /= 4;
      bgG /= 4;
      bgB /= 4;

      const tolerance = 48; // Euclidean color distance tolerance

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
        if (dist < tolerance) {
          // Feather edges
          const alphaFactor = Math.max(0, (dist - (tolerance - 16)) / 16);
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png');
    };

    img.onerror = reject;
  });
}
