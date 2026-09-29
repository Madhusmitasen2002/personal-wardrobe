import React from 'react';

/**
 * Snapchat / Bitmoji-style Vector Avatar
 * Renders an expressive 2.5D stylized character who dynamically wears
 * the colors and garment cuts of the selected clothing items.
 */
export default function SnapchatAvatar({
  avatarSettings = {},
  topStyle = { type: 'tshirt', color: '#3b82f6' },
  bottomStyle = { type: 'jeans', color: '#1e3a8a' },
  shoeStyle = { type: 'sneakers', color: '#ffffff' },
  width = 240,
  height = 420,
}) {
  const skin = avatarSettings?.skinTone || '#f3c7a2';
  const hair = avatarSettings?.hairColor || '#2c1b18';
  const hairStyle = avatarSettings?.hairStyle || 'long';
  const gender = avatarSettings?.gender || 'female';

  // Shadow tint of skin for 2.5D depth
  const skinShadow = adjustBrightness(skin, -25);
  const skinHighlight = adjustBrightness(skin, 20);

  // Clothing colors
  const topColor = topStyle?.color || '#3b82f6';
  const topShadow = adjustBrightness(topColor, -30);
  const bottomColor = bottomStyle?.color || '#1e3a8a';
  const bottomShadow = adjustBrightness(bottomColor, -30);
  const shoeColor = shoeStyle?.color || '#ffffff';
  const shoeShadow = adjustBrightness(shoeColor, -25);

  return (
    <svg
      viewBox="0 0 200 360"
      width={width}
      height={height}
      style={{ overflow: 'visible', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))' }}
    >
      <defs>
        {/* Subtle drop shadow */}
        <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.25" />
        </filter>

        <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={skinHighlight} />
          <stop offset="60%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShadow} />
        </linearGradient>

        <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={adjustBrightness(hair, 30)} />
          <stop offset="100%" stopColor={hair} />
        </linearGradient>

        <linearGradient id="topGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={adjustBrightness(topColor, 20)} />
          <stop offset="100%" stopColor={topShadow} />
        </linearGradient>

        <linearGradient id="bottomGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={adjustBrightness(bottomColor, 15)} />
          <stop offset="100%" stopColor={bottomShadow} />
        </linearGradient>
      </defs>

      {/* ─── Back Hair (Long Waves / Afro) ─── */}
      {hairStyle === 'long' && (
        <path
          d="M62 70 C40 110, 35 170, 48 200 C58 205, 75 190, 72 140 C80 135, 120 135, 128 140 C125 190, 142 205, 152 200 C165 170, 160 110, 138 70 Z"
          fill="url(#hairGrad)"
        />
      )}
      {hairStyle === 'afro' && (
        <ellipse cx="100" cy="62" rx="46" ry="42" fill="url(#hairGrad)" />
      )}

      {/* ─── Legs / Lower Body ─── */}
      <g id="avatar-legs">
        {/* Left Leg */}
        <path
          d="M82 200 L76 295 L90 295 L96 200 Z"
          fill={bottomStyle.type === 'shorts' || bottomStyle.type === 'skirt' ? 'url(#skinGrad)' : 'url(#bottomGrad)'}
        />
        {/* Right Leg */}
        <path
          d="M104 200 L110 295 L124 295 L118 200 Z"
          fill={bottomStyle.type === 'shorts' || bottomStyle.type === 'skirt' ? 'url(#skinGrad)' : 'url(#bottomGrad)'}
        />

        {/* Knees shade if shorts/skirt */}
        {(bottomStyle.type === 'shorts' || bottomStyle.type === 'skirt') && (
          <>
            <ellipse cx="83" cy="245" rx="5" ry="3" fill={skinShadow} opacity="0.4" />
            <ellipse cx="117" cy="245" rx="5" ry="3" fill={skinShadow} opacity="0.4" />
          </>
        )}
      </g>

      {/* ─── Bottom Garment (Pants / Skirt / Jeans) ─── */}
      <g id="avatar-bottom">
        {bottomStyle.type === 'skirt' ? (
          <path
            d="M74 175 L126 175 L138 230 C120 236, 80 236, 62 230 Z"
            fill="url(#bottomGrad)"
            filter="url(#subtleShadow)"
          />
        ) : bottomStyle.type === 'shorts' ? (
          <path
            d="M74 175 L126 175 L130 215 L106 215 L100 195 L94 215 L70 215 Z"
            fill="url(#bottomGrad)"
            filter="url(#subtleShadow)"
          />
        ) : (
          /* Pants / Jeans */
          <g>
            <path
              d="M74 175 L126 175 L124 292 L108 292 L100 210 L92 292 L76 292 Z"
              fill="url(#bottomGrad)"
              filter="url(#subtleShadow)"
            />
            {/* Denim / Trouser Crease line */}
            <path d="M84 210 L83 285" stroke={bottomShadow} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M116 210 L117 285" stroke={bottomShadow} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            {bottomStyle.type === 'jeans' && (
              /* Waistband & pocket rivets */
              <>
                <line x1="74" y1="180" x2="126" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
                <circle cx="80" cy="188" r="1.5" fill="#f59e0b" />
                <circle cx="120" cy="188" r="1.5" fill="#f59e0b" />
              </>
            )}
          </g>
        )}
      </g>

      {/* ─── Shoes ─── */}
      <g id="avatar-shoes">
        {shoeStyle.type === 'heels' ? (
          /* High Heels */
          <>
            <path d="M74 293 L88 293 L88 300 L76 304 L74 300 Z" fill={shoeColor} />
            <path d="M75 304 L75 315 L78 315 L78 304 Z" fill={shoeShadow} />
            <path d="M112 293 L126 293 L126 300 L114 304 L112 300 Z" fill={shoeColor} />
            <path d="M113 304 L113 315 L116 315 L116 304 Z" fill={shoeShadow} />
          </>
        ) : shoeStyle.type === 'boots' ? (
          /* Ankle Boots */
          <>
            <path d="M73 285 L89 285 L91 306 L71 306 Z" fill={shoeColor} />
            <rect x="70" y="303" width="22" height="6" rx="2" fill={shoeShadow} />
            <path d="M111 285 L127 285 L129 306 L109 306 Z" fill={shoeColor} />
            <rect x="108" y="303" width="22" height="6" rx="2" fill={shoeShadow} />
          </>
        ) : (
          /* Cool Sneakers */
          <>
            <path d="M72 290 L88 290 C92 295, 94 303, 93 306 L68 306 C68 300, 70 293, 72 290 Z" fill={shoeColor} />
            <rect x="67" y="303" width="27" height="5" rx="2.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
            <line x1="77" y1="294" x2="84" y2="294" stroke={shoeShadow} strokeWidth="1.5" strokeLinecap="round" />

            <path d="M112 290 L128 290 C132 295, 134 303, 133 306 L108 306 C108 300, 110 293, 112 290 Z" fill={shoeColor} />
            <rect x="107" y="303" width="27" height="5" rx="2.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
            <line x1="117" y1="294" x2="124" y2="294" stroke={shoeShadow} strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* ─── Arms (Under or on Top) ─── */}
      <g id="avatar-arms">
        {/* Left Arm (Relaxed) */}
        <path d="M70 115 L52 165 L57 195 L65 194 L60 165 L76 122 Z" fill="url(#skinGrad)" />
        {/* Right Arm (Hand on Hip pose) */}
        <path d="M130 115 L148 155 L135 180 L126 177 L140 152 L124 122 Z" fill="url(#skinGrad)" />
      </g>

      {/* ─── Torso / Top Garment ─── */}
      <g id="avatar-top">
        {topStyle.type === 'blazer' ? (
          /* Tailored Blazer with Lapels */
          <g filter="url(#subtleShadow)">
            <path d="M68 112 L132 112 L128 180 L72 180 Z" fill="url(#topGrad)" />
            {/* Sleeves */}
            <path d="M68 112 L50 162 L60 164 L74 125 Z" fill="url(#topGrad)" />
            <path d="M132 112 L148 152 L138 155 L126 125 Z" fill="url(#topGrad)" />
            {/* Inner top */}
            <polygon points="90,112 110,112 100,140" fill="#ffffff" />
            {/* Blazer Lapels */}
            <polygon points="68,112 88,148 78,175 68,112" fill={topShadow} />
            <polygon points="132,112 112,148 122,175 132,112" fill={topShadow} />
            {/* Gold/Silver button */}
            <circle cx="100" cy="158" r="2.5" fill="#f59e0b" />
          </g>
        ) : topStyle.type === 'shirt' ? (
          /* Collared Button-Up Shirt */
          <g filter="url(#subtleShadow)">
            <path d="M70 112 L130 112 L126 178 L74 178 Z" fill="url(#topGrad)" />
            {/* Short/Rolled sleeves */}
            <path d="M70 112 L56 142 L67 145 L76 125 Z" fill="url(#topGrad)" />
            <path d="M130 112 L144 142 L133 145 L124 125 Z" fill="url(#topGrad)" />
            {/* Collar */}
            <polygon points="86,110 100,122 88,126" fill={topShadow} />
            <polygon points="114,110 100,122 112,126" fill={topShadow} />
            {/* Center placket & buttons */}
            <line x1="100" y1="122" x2="100" y2="178" stroke={topShadow} strokeWidth="1" />
            <circle cx="100" cy="135" r="1.5" fill="#ffffff" />
            <circle cx="100" cy="148" r="1.5" fill="#ffffff" />
            <circle cx="100" cy="162" r="1.5" fill="#ffffff" />
          </g>
        ) : topStyle.type === 'hoodie' || topStyle.type === 'sweater' ? (
          /* Cozy Knit Sweater / Hoodie */
          <g filter="url(#subtleShadow)">
            <path d="M66 110 L134 110 L130 182 L70 182 Z" fill="url(#topGrad)" />
            {/* Sweaters long sleeves */}
            <path d="M66 110 L48 165 L58 168 L74 122 Z" fill="url(#topGrad)" />
            <path d="M134 110 L150 155 L140 158 L126 122 Z" fill="url(#topGrad)" />
            {/* Ribbed neck */}
            <path d="M88 110 C92 117, 108 117, 112 110 Z" fill={topShadow} />
            {topStyle.type === 'hoodie' && (
              <>
                <path d="M86 114 C86 125, 96 130, 96 138" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M114 114 C114 125, 104 130, 104 138" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                {/* Pouch */}
                <path d="M84 155 L116 155 L112 176 L88 176 Z" fill={topShadow} opacity="0.5" />
              </>
            )}
          </g>
        ) : (
          /* Classic Crewneck T-Shirt */
          <g filter="url(#subtleShadow)">
            <path d="M72 112 L128 112 L125 178 L75 178 Z" fill="url(#topGrad)" />
            <path d="M72 112 L56 135 L68 138 L76 122 Z" fill="url(#topGrad)" />
            <path d="M128 112 L144 135 L132 138 L124 122 Z" fill="url(#topGrad)" />
            {/* Crewneck curve */}
            <path d="M88 112 C90 120, 110 120, 112 112 Z" fill={skin} />
            <path d="M88 112 C90 121, 110 121, 112 112" stroke={topShadow} strokeWidth="1.5" fill="none" />
          </g>
        )}
      </g>

      {/* ─── Neck ─── */}
      <rect x="94" y="96" width="12" height="18" fill="url(#skinGrad)" rx="2" />
      <path d="M94 108 C98 112, 102 112, 106 108" stroke={skinShadow} strokeWidth="1" fill="none" opacity="0.6" />

      {/* ─── Head & Face ─── */}
      <g id="avatar-head">
        {/* Head Base */}
        <ellipse cx="100" cy="72" rx="22" ry="26" fill="url(#skinGrad)" filter="url(#subtleShadow)" />

        {/* Cute Ears */}
        <ellipse cx="77" cy="74" rx="4" ry="7" fill="url(#skinGrad)" />
        <ellipse cx="123" cy="74" rx="4" ry="7" fill="url(#skinGrad)" />

        {/* Eyes (Snapchat / Bitmoji style: big, warm, expressive) */}
        <g id="eyes">
          {/* Left Eye */}
          <ellipse cx="90" cy="71" rx="5" ry="6.5" fill="#1e293b" />
          <ellipse cx="89" cy="69" rx="2" ry="2" fill="#ffffff" />
          <circle cx="92" cy="73" r="0.8" fill="#ffffff" />
          {/* Eyelash / liner */}
          <path d="M84 68 Q90 64 96 68" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" fill="none" />

          {/* Right Eye */}
          <ellipse cx="110" cy="71" rx="5" ry="6.5" fill="#1e293b" />
          <ellipse cx="109" cy="69" rx="2" ry="2" fill="#ffffff" />
          <circle cx="112" cy="73" r="0.8" fill="#ffffff" />
          {/* Eyelash / liner */}
          <path d="M104 68 Q110 64 116 68" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </g>

        {/* Eyebrows */}
        <path d="M84 61 Q90 57 97 61" stroke={hair} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M103 61 Q110 57 116 61" stroke={hair} strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Cute Nose */}
        <path d="M99 74 Q101 79 97 80" stroke={skinShadow} strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Soft Cheeks Blush */}
        <ellipse cx="85" cy="79" rx="5" ry="2.5" fill="#f43f5e" opacity="0.35" />
        <ellipse cx="115" cy="79" rx="5" ry="2.5" fill="#f43f5e" opacity="0.35" />

        {/* Smile */}
        <path d="M93 84 Q100 90 107 84" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* ─── Front Hair ─── */}
      <g id="avatar-front-hair">
        {hairStyle === 'short' ? (
          /* Trendy Chic Bob */
          <path
            d="M76 68 C74 44, 126 44, 124 68 C124 82, 120 95, 116 98 C116 80, 108 65, 100 65 C92 65, 84 80, 84 98 C80 95, 76 82, 76 68 Z"
            fill="url(#hairGrad)"
          />
        ) : hairStyle === 'bun' ? (
          /* High Topknot Bun */
          <>
            <circle cx="100" cy="38" r="14" fill="url(#hairGrad)" />
            <path
              d="M77 65 C76 46, 124 46, 123 65 C115 58, 85 58, 77 65 Z"
              fill="url(#hairGrad)"
            />
          </>
        ) : hairStyle === 'fade' ? (
          /* Sharp Modern Quiff */
          <path
            d="M76 65 C76 40, 118 36, 124 60 C124 72, 120 72, 118 64 C112 55, 88 56, 82 66 C78 68, 76 66, 76 65 Z"
            fill="url(#hairGrad)"
          />
        ) : (
          /* Parted Beach Waves (Default Long) */
          <path
            d="M78 65 C76 44, 124 44, 122 65 C124 80, 128 100, 124 135 C120 105, 112 70, 100 68 C88 70, 80 105, 76 135 C72 100, 76 80, 78 65 Z"
            fill="url(#hairGrad)"
          />
        )}
      </g>
    </svg>
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
