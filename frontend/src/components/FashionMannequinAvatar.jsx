import React from 'react';

/**
 * High-Fashion Parametric Mannequin Avatar
 * Replaces the basic Bitmoji SVG with an aspirational, editorial fashion silhouette.
 * Features:
 * - Parametric anatomical scaling (shoulders, waist cinch, hips, height)
 * - Skin tone + undertone lighting
 * - Multi-layer z-indexing: Skin -> Top -> Bottom -> Layer/Coat -> Footwear -> Accessories
 * - Ambient occlusion drop shadows and pedestal glow
 */
export default function FashionMannequinAvatar({
  proportions = { shoulders: 50, waist: 50, hips: 50, heightScale: 1.0 },
  skinTone = '#f3c7a2',
  skinUndertone = 'warm',
  top = null,
  bottom = null,
  layer = null,
  shoe = null,
  accessory = null,
  width = 280,
  height = 500,
  activeLighting = 'runway', // 'runway' | 'golden' | 'editorial' | 'studio'
  showPhotoOverlay = false,
}) {
  // Proportional offsets
  const shoulderFactor = 0.85 + (proportions.shoulders / 100) * 0.3; // 0.85 to 1.15
  const waistFactor = 0.8 + (proportions.waist / 100) * 0.4;       // 0.8 to 1.2
  const hipFactor = 0.85 + (proportions.hips / 100) * 0.35;        // 0.85 to 1.2

  // Lighting adjustments
  const skinShadow = adjustBrightness(skinTone, -28);
  const skinHighlight = adjustBrightness(skinTone, 18);

  const lightingFilter =
    activeLighting === 'golden'
      ? 'sepia(0.2) saturate(1.2)'
      : activeLighting === 'editorial'
      ? 'contrast(1.1) brightness(0.95)'
      : 'none';

  return (
    <div
      className="fashion-avatar-container"
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: lightingFilter,
        overflow: 'visible',
      }}
    >
      <svg
        viewBox="0 0 240 480"
        width="100%"
        height="100%"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.6))' }}
      >
        <defs>
          <filter id="mannequinDepth" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity="0.3" />
          </filter>

          <linearGradient id="pedestalGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id="skinShade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={skinHighlight} />
            <stop offset="45%" stopColor={skinTone} />
            <stop offset="100%" stopColor={skinShadow} />
          </linearGradient>

          <linearGradient id="fabricShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
          </linearGradient>
        </defs>

        {/* ─── Podium Glow ─── */}
        <ellipse cx="120" cy="460" rx="90" ry="18" fill="url(#pedestalGlow)" opacity="0.8" />
        <ellipse cx="120" cy="460" rx="70" ry="12" fill="#0f0f17" stroke="rgba(124, 58, 237, 0.3)" strokeWidth="1.5" />

        {/* ─── LAYER 0: BASE BODY / MANNEQUIN ─── */}
        <g id="body-base">
          {/* Head & Neck */}
          <rect x="113" y="80" width="14" height="24" rx="3" fill="url(#skinShade)" />
          <ellipse cx="120" cy="54" rx="20" ry="26" fill="url(#skinShade)" filter="url(#mannequinDepth)" />
          {/* Subtle facial silhouette / high-fashion sculpture */}
          <path d="M120 46 L120 62 L123 64" stroke={skinShadow} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
          <ellipse cx="120" cy="70" rx="5" ry="1.5" fill={skinShadow} opacity="0.4" />

          {/* Shoulders & Torso */}
          <path
            d={`M${120 - 46 * shoulderFactor} 104 
                C${120 - 25 * shoulderFactor} 96, ${120 + 25 * shoulderFactor} 96, ${120 + 46 * shoulderFactor} 104
                L${120 + 38 * shoulderFactor} 150
                C${120 + 30 * waistFactor} 185, ${120 + 32 * waistFactor} 200, ${120 + 40 * hipFactor} 230
                L${120 - 40 * hipFactor} 230
                C${120 - 32 * waistFactor} 200, ${120 - 30 * waistFactor} 185, ${120 - 38 * shoulderFactor} 150
                Z`}
            fill="url(#skinShade)"
            filter="url(#mannequinDepth)"
          />

          {/* Arms (Fashion stance: elegant, elongated runway posture) */}
          {/* Left Arm */}
          <path
            d={`M${120 - 46 * shoulderFactor} 104 
                L${120 - 58 * shoulderFactor} 190 
                L${120 - 50 * shoulderFactor} 275 
                L${120 - 44 * shoulderFactor} 275 
                L${120 - 50 * shoulderFactor} 190 
                L${120 - 38 * shoulderFactor} 110 Z`}
            fill="url(#skinShade)"
          />
          {/* Right Arm */}
          <path
            d={`M${120 + 46 * shoulderFactor} 104 
                L${120 + 58 * shoulderFactor} 190 
                L${120 + 50 * shoulderFactor} 275 
                L${120 + 44 * shoulderFactor} 275 
                L${120 + 50 * shoulderFactor} 190 
                L${120 + 38 * shoulderFactor} 110 Z`}
            fill="url(#skinShade)"
          />

          {/* Legs */}
          {/* Left Leg */}
          <path
            d={`M${120 - 36 * hipFactor} 230 
                L${120 - 26 * hipFactor} 340 
                L${120 - 24} 440 
                L${120 - 10} 440 
                L${120 - 16 * hipFactor} 340 
                L${120 - 6} 230 Z`}
            fill="url(#skinShade)"
          />
          {/* Right Leg */}
          <path
            d={`M${120 + 6} 230 
                L${120 + 16 * hipFactor} 340 
                L${120 + 10} 440 
                L${120 + 24} 440 
                L${120 + 26 * hipFactor} 340 
                L${120 + 36 * hipFactor} 230 Z`}
            fill="url(#skinShade)"
          />
        </g>

        {/* ─── LAYER 1: INNER TOP (Tailored Vector Drape with Garment Color) ─── */}
        <g id="tailored-top" opacity="0.95">
          <path
            d={`M${120 - 40 * shoulderFactor} 105 
                C${120 - 20 * shoulderFactor} 116, ${120 + 20 * shoulderFactor} 116, ${120 + 40 * shoulderFactor} 105 
                L${120 + 32 * waistFactor} 205 
                L${120 - 32 * waistFactor} 205 Z`}
            fill={top?.color?.hex || (top ? '#ffffff' : '#272738')}
            stroke="#a855f7"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
        </g>

        {/* ─── LAYER 2: BOTTOM (Tailored Vector Trousers with Garment Color) ─── */}
        <g id="tailored-bottom" opacity="0.95">
          <path
            d={`M${120 - 35 * waistFactor} 205 
                L${120 + 35 * waistFactor} 205 
                L${120 + 38 * hipFactor} 235 
                L${120 + 26} 420 
                L${120 + 12} 420 
                L120 250 
                L${120 - 12} 420 
                L${120 - 26} 420 
                L${120 - 38 * hipFactor} 235 Z`}
            fill={bottom?.color?.hex || (bottom ? '#334155' : '#181824')}
            stroke="#a855f7"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
        </g>

        {/* ─── LAYER 3: OUTER LAYER / JACKET (Worn Over Top & Bottom) ─── */}
        {layer && (
          <g id="tailored-layer" filter="url(#mannequinDepth)">
            {/* Structured Blazer or Trench Coat Silhouette */}
            <path
              d={`M${120 - 48 * shoulderFactor} 100 
                  L${120 - 18} 106 
                  L${120 - 26} 160 
                  L${120 - 40 * hipFactor} 260 
                  L${120 - 52 * hipFactor} 255 
                  L${120 - 52 * shoulderFactor} 115 Z`}
              fill={layer?.color?.hex || '#c29b62'}
              stroke="#a855f7"
              strokeWidth="1.2"
            />
            <path
              d={`M${120 + 48 * shoulderFactor} 100 
                  L${120 + 18} 106 
                  L${120 + 26} 160 
                  L${120 + 40 * hipFactor} 260 
                  L${120 + 52 * hipFactor} 255 
                  L${120 + 52 * shoulderFactor} 115 Z`}
              fill={layer?.color?.hex || '#c29b62'}
              stroke="#a855f7"
              strokeWidth="1.2"
            />
          </g>
        )}

        {/* ─── LAYER 4: FOOTWEAR ─── */}
        {shoe && (
          <g id="tailored-shoes">
            <ellipse cx={120 - 18} cy={432} rx={14} ry={6} fill={shoe?.color?.hex || '#1e293b'} />
            <ellipse cx={120 + 18} cy={432} rx={14} ry={6} fill={shoe?.color?.hex || '#1e293b'} />
          </g>
        )}
      </svg>

      {/* ─── OPTIONAL REAL GARMENTS OVERLAY (WHEN PHOTOS HAVE TRANSPARENT CUTOUTS) ─── */}
      {showPhotoOverlay && (
        <div className="fashion-garment-layer-stack">
          {/* Slot 1: Inner Top */}
          {top?.imageUrl && (
            <div
              className="garment-anchor-slot garment-anchor-slot--top"
              style={{
                top: '20%',
                width: `${140 * shoulderFactor}px`,
                maxHeight: '170px',
                zIndex: 2,
              }}
            >
              <img src={top.imageUrl} alt={top.name} className="garment-anchor-img" />
            </div>
          )}

          {/* Slot 2: Bottom */}
          {bottom?.imageUrl && (
            <div
              className="garment-anchor-slot garment-anchor-slot--bottom"
              style={{
                top: '41%',
                width: `${140 * hipFactor}px`,
                maxHeight: '230px',
                zIndex: 3,
              }}
            >
              <img src={bottom.imageUrl} alt={bottom.name} className="garment-anchor-img" />
            </div>
          )}

          {/* Slot 3: Outer Layer (Worn OVER top & bottom) */}
          {layer?.imageUrl && (
            <div
              className="garment-anchor-slot garment-anchor-slot--layer"
              style={{
                top: '18%',
                width: `${165 * shoulderFactor}px`,
                maxHeight: '250px',
                zIndex: 4,
              }}
            >
              <img
                src={layer.imageUrl}
                alt={layer.name}
                className="garment-anchor-img garment-anchor-img--layer"
              />
            </div>
          )}

          {/* Slot 4: Footwear */}
          {shoe?.imageUrl && (
            <div
              className="garment-anchor-slot garment-anchor-slot--shoe"
              style={{
                bottom: '4%',
                width: '100px',
                maxHeight: '75px',
                zIndex: 5,
              }}
            >
              <img src={shoe.imageUrl} alt={shoe.name} className="garment-anchor-img" />
            </div>
          )}

          {/* Slot 5: Accessory */}
          {accessory?.imageUrl && (
            <div
              className="garment-anchor-slot garment-anchor-slot--accessory"
              style={{
                top: '38%',
                right: '8%',
                width: '80px',
                maxHeight: '90px',
                zIndex: 6,
              }}
            >
              <img src={accessory.imageUrl} alt={accessory.name} className="garment-anchor-img" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function adjustBrightness(hex, percent) {
  if (!hex || hex[0] !== '#') return hex;
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
