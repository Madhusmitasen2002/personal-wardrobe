/**
 * Garment Visual Analysis & Color Extraction Utility
 * Analyzes garment names and images to dynamically dress the Bitmoji-style avatar
 */

export function extractGarmentStyle(item) {
  if (!item) return { type: 'default', color: '#cbd5e1' };

  const name = (item.name || '').toLowerCase();
  const category = (item.category || '').toLowerCase();

  let type = 'default';

  if (category === 'top') {
    if (name.includes('blazer') || name.includes('jacket') || name.includes('coat')) {
      type = 'blazer';
    } else if (name.includes('sweater') || name.includes('knit') || name.includes('cardigan')) {
      type = 'sweater';
    } else if (name.includes('hoodie') || name.includes('sweatshirt')) {
      type = 'hoodie';
    } else if (name.includes('shirt') || name.includes('linen') || name.includes('blouse') || name.includes('button')) {
      type = 'shirt';
    } else {
      type = 'tshirt';
    }
  } else if (category === 'bottom') {
    if (name.includes('skirt')) {
      type = 'skirt';
    } else if (name.includes('short')) {
      type = 'shorts';
    } else if (name.includes('denim') || name.includes('jean')) {
      type = 'jeans';
    } else {
      type = 'trousers';
    }
  } else if (category === 'shoe') {
    if (name.includes('boot') || name.includes('chelsea')) {
      type = 'boots';
    } else if (name.includes('heel') || name.includes('pump') || name.includes('sandal')) {
      type = 'heels';
    } else {
      type = 'sneakers';
    }
  }

  // Detect basic colors from garment name as fast heuristic
  let fallbackColor = '#64748b';
  if (name.includes('white') || name.includes('linen') || name.includes('cream')) fallbackColor = '#f8fafc';
  else if (name.includes('black') || name.includes('dark')) fallbackColor = '#1e293b';
  else if (name.includes('blue') || name.includes('denim') || name.includes('indigo')) fallbackColor = '#3b82f6';
  else if (name.includes('lavender') || name.includes('purple') || name.includes('lilac')) fallbackColor = '#c084fc';
  else if (name.includes('pink') || name.includes('rose')) fallbackColor = '#f472b6';
  else if (name.includes('green') || name.includes('olive')) fallbackColor = '#10b981';
  else if (name.includes('beige') || name.includes('tan') || name.includes('khaki') || name.includes('brown')) fallbackColor = '#d97706';
  else if (name.includes('red') || name.includes('burgundy')) fallbackColor = '#ef4444';
  else if (name.includes('grey') || name.includes('gray')) fallbackColor = '#94a3b8';

  return { type, color: fallbackColor };
}

export function sampleDominantColor(imageUrl, fallback = '#64748b') {
  if (!imageUrl) return Promise.resolve(fallback);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 40, 40);

        const imgData = ctx.getImageData(8, 8, 24, 24).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const pr = imgData[i];
          const pg = imgData[i + 1];
          const pb = imgData[i + 2];
          const brightness = (pr + pg + pb) / 3;

          // Skip extreme whites or extreme blacks (backgrounds)
          if (brightness > 240 || brightness < 15) continue;

          r += pr;
          g += pg;
          b += pb;
          count++;
        }

        if (count === 0) return resolve(fallback);

        const hex = rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count));
        resolve(hex);
      } catch (err) {
        resolve(fallback);
      }
    };

    img.onerror = () => resolve(fallback);
  });
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
