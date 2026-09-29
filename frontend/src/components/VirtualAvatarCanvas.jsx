import { useState, useEffect } from 'react';
import SnapchatAvatar from './SnapchatAvatar';
import FashionMannequinAvatar from './FashionMannequinAvatar';
import AvatarPrototypeShowcase from './AvatarPrototypeShowcase';
import { extractGarmentStyle, sampleDominantColor } from '../utils/garmentVisuals';
import './VirtualAvatarCanvas.css';

export default function VirtualAvatarCanvas({
  avatar,
  top,
  bottom,
  layer = null,
  shoe,
  accessory = null,
  onOpenCustomizer,
  onCycleCategory,
}) {
  const hasPhotoAvatar = Boolean(avatar?.type === 'photo' && avatar?.photoUrl);
  const [showProtoModal, setShowProtoModal] = useState(false);

  // Initialize displayMode: if user has a personal photo avatar, start in 'photo' mode; otherwise 'tryon'
  const [displayMode, setDisplayMode] = useState(() => {
    if (avatar?.type === 'photo' && avatar?.photoUrl) return 'photo';
    return 'nextgen';
  });


  // Automatically switch to 'photo' mode when a photo avatar is detected or updated
  useEffect(() => {
    if (avatar?.type === 'photo' && avatar?.photoUrl) {
      setDisplayMode('photo');
    }
  }, [avatar?.type, avatar?.photoUrl]);

  // Garment visual states (cuts and sampled colors for avatar mode)
  const [topStyle, setTopStyle] = useState({ type: 'tshirt', color: '#3b82f6' });
  const [bottomStyle, setBottomStyle] = useState({ type: 'jeans', color: '#1e3a8a' });
  const [shoeStyle, setShoeStyle] = useState({ type: 'sneakers', color: '#ffffff' });

  // Virtual Try-on interactive adjustments
  const [blendMode, setBlendMode] = useState(false);
  const [garmentScale, setGarmentScale] = useState(1);
  const [topNudge, setTopNudge] = useState(0);
  const [bottomNudge, setBottomNudge] = useState(0);

  // Dynamically analyze garments and sample dominant color
  useEffect(() => {
    let isMounted = true;

    async function analyzeGarments() {
      // 1. Top
      if (top) {
        const heuristic = extractGarmentStyle(top);
        const sampledColor = await sampleDominantColor(top.imageUrl, heuristic.color);
        if (isMounted) setTopStyle({ type: heuristic.type, color: sampledColor });
      } else {
        if (isMounted) setTopStyle({ type: 'tshirt', color: '#94a3b8' });
      }

      // 2. Bottom
      if (bottom) {
        const heuristic = extractGarmentStyle(bottom);
        const sampledColor = await sampleDominantColor(bottom.imageUrl, heuristic.color);
        if (isMounted) setBottomStyle({ type: heuristic.type, color: sampledColor });
      } else {
        if (isMounted) setBottomStyle({ type: 'jeans', color: '#475569' });
      }

      // 3. Shoe
      if (shoe) {
        const heuristic = extractGarmentStyle(shoe);
        const sampledColor = await sampleDominantColor(shoe.imageUrl, heuristic.color);
        if (isMounted) setShoeStyle({ type: heuristic.type, color: sampledColor });
      } else {
        if (isMounted) setShoeStyle({ type: 'sneakers', color: '#f8fafc' });
      }
    }

    analyzeGarments();

    return () => {
      isMounted = false;
    };
  }, [top, bottom, shoe]);

  const handleResetAdjustments = () => {
    setGarmentScale(1);
    setTopNudge(0);
    setBottomNudge(0);
  };

  return (
    <div className="avatar-canvas-container">
      <div className="avatar-stage">
        {/* Ambient spotlight */}
        <div className="avatar-spotlight" />

        {/* Podium */}
        <div className="avatar-podium" />

        {/* Top Header Bar */}
        <div className="avatar-stage-header">
          <div className="avatar-vibe-badge">
            <span>✨</span>
            <span>
              {top && bottom && shoe
                ? 'Coordinated Look · 98% Harmony'
                : top && bottom
                ? 'Styling Top & Bottom'
                : 'Runway Dressing Room'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="avatar-edit-trigger"
              style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', color: '#fff', border: 'none', fontWeight: 600 }}
              onClick={() => setShowProtoModal(true)}
              title="Launch Hybrid 2D + AI Try-On Prototype"
            >
              ✨ Next-Gen Studio (2D + AI)
            </button>
            <button
              type="button"
              className="avatar-edit-trigger"
              onClick={onOpenCustomizer}
              title="Open Avatar Studio"
            >
              👤 Customize
            </button>
          </div>
        </div>

        {/* ─── MODE 0: NEXT-GEN HIGH-FASHION MANNEQUIN (ANCHORED REAL PIECES) ─── */}
        {displayMode === 'nextgen' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FashionMannequinAvatar
              proportions={avatar?.proportions || { shoulders: 50, waist: 50, hips: 50, heightScale: 1.0 }}
              skinTone={avatar?.skinTone || '#f3c7a2'}
              activeLighting="runway"
              top={top}
              bottom={bottom}
              layer={layer}
              shoe={shoe}
              accessory={accessory}
              width={260}
              height={440}
            />
          </div>
        )}


        {/* ─── MODE 1: PERSONAL PHOTO MUSE (LOOKBOOK SPLIT) ─── */}
        {displayMode === 'photo' && (
          <div className="lookbook-split-layout animate-fade-in">
            {/* Left Column: User's Actual Photo */}
            <div className="lookbook-model-col">
              <div className="lookbook-model-frame">
                {avatar?.photoUrl ? (
                  <img src={avatar.photoUrl} alt="Personal Style Muse" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    <span>📸</span>
                    <span style={{ fontSize: '0.8rem', marginTop: 8 }}>No photo uploaded</span>
                  </div>
                )}
                <div className="lookbook-model-badge">✨ Personal Style Muse</div>
              </div>
            </div>

            {/* Right Column: User's Actual Clothing Items */}
            <div className="lookbook-garments-col">
              {/* TOP GARMENT CARD */}
              <div
                className="garment-rack-card"
                onClick={() => onCycleCategory && onCycleCategory('top', 1)}
                title="Click to cycle next top"
              >
                <div className="garment-rack-thumb">
                  {top?.imageUrl ? (
                    <img src={top.imageUrl} alt={top.name} />
                  ) : (
                    <span style={{ fontSize: '1.4rem' }}>👕</span>
                  )}
                </div>
                <div className="garment-rack-info">
                  <div className="garment-rack-tag">
                    <span>Top</span>
                    <span className="garment-rack-cycle-arrow">▶</span>
                  </div>
                  <div className="garment-rack-name">{top?.name || 'No top selected'}</div>
                </div>
              </div>

              {/* BOTTOM GARMENT CARD */}
              <div
                className="garment-rack-card"
                onClick={() => onCycleCategory && onCycleCategory('bottom', 1)}
                title="Click to cycle next bottom"
              >
                <div className="garment-rack-thumb">
                  {bottom?.imageUrl ? (
                    <img src={bottom.imageUrl} alt={bottom.name} />
                  ) : (
                    <span style={{ fontSize: '1.4rem' }}>👖</span>
                  )}
                </div>
                <div className="garment-rack-info">
                  <div className="garment-rack-tag">
                    <span>Bottom</span>
                    <span className="garment-rack-cycle-arrow">▶</span>
                  </div>
                  <div className="garment-rack-name">{bottom?.name || 'No bottom selected'}</div>
                </div>
              </div>

              {/* SHOES GARMENT CARD */}
              <div
                className="garment-rack-card"
                onClick={() => onCycleCategory && onCycleCategory('shoe', 1)}
                title="Click to cycle next footwear"
              >
                <div className="garment-rack-thumb">
                  {shoe?.imageUrl ? (
                    <img src={shoe.imageUrl} alt={shoe.name} />
                  ) : (
                    <span style={{ fontSize: '1.4rem' }}>👟</span>
                  )}
                </div>
                <div className="garment-rack-info">
                  <div className="garment-rack-tag">
                    <span>Footwear</span>
                    <span className="garment-rack-cycle-arrow">▶</span>
                  </div>
                  <div className="garment-rack-name">{shoe?.name || 'No footwear selected'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODE 2: INTERACTIVE VIRTUAL TRY-ON (REAL CLOTHES ON FIGURE) ─── */}
        {displayMode === 'tryon' && (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="tryon-stage-area">
              <div className="tryon-figure-wrap">
                {/* Base Body: User's photo or sleek runway silhouette */}
                {hasPhotoAvatar ? (
                  <img src={avatar.photoUrl} alt="Model Base" className="tryon-base-model" />
                ) : (
                  <svg className="tryon-mannequin-svg" viewBox="0 0 160 380">
                    <defs>
                      <linearGradient id="mannequinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b3b4f" />
                        <stop offset="50%" stopColor="#252538" />
                        <stop offset="100%" stopColor="#151522" />
                      </linearGradient>
                    </defs>
                    {/* Head */}
                    <circle cx="80" cy="35" r="22" fill="url(#mannequinGrad)" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.4" />
                    {/* Neck */}
                    <rect x="74" y="56" width="12" height="15" fill="url(#mannequinGrad)" />
                    {/* Torso & Shoulders */}
                    <path d="M40 71 C55 68, 105 68, 120 71 L112 185 L48 185 Z" fill="url(#mannequinGrad)" stroke="#7c3aed" strokeWidth="1.2" strokeOpacity="0.3" />
                    {/* Pelvis & Legs */}
                    <path d="M48 185 L54 340 L76 340 L78 200 L82 200 L84 340 L106 340 L112 185 Z" fill="url(#mannequinGrad)" stroke="#7c3aed" strokeWidth="1.2" strokeOpacity="0.3" />
                    {/* Arms */}
                    <path d="M40 72 L32 180 L40 180 L46 76 Z" fill="url(#mannequinGrad)" opacity="0.8" />
                    <path d="M120 72 L128 180 L120 180 L114 76 Z" fill="url(#mannequinGrad)" opacity="0.8" />
                  </svg>
                )}

                {/* Overlaid Real Top */}
                {top?.imageUrl && (
                  <div
                    className={`tryon-garment tryon-garment--top ${blendMode ? 'tryon-garment--blend' : ''}`}
                    style={{
                      transform: `translate(-50%, ${topNudge}px) scale(${garmentScale})`,
                    }}
                    title={top.name}
                  >
                    <img src={top.imageUrl} alt={top.name} />
                  </div>
                )}

                {/* Overlaid Real Bottom */}
                {bottom?.imageUrl && (
                  <div
                    className={`tryon-garment tryon-garment--bottom ${blendMode ? 'tryon-garment--blend' : ''}`}
                    style={{
                      transform: `translate(-50%, ${bottomNudge}px) scale(${garmentScale})`,
                    }}
                    title={bottom.name}
                  >
                    <img src={bottom.imageUrl} alt={bottom.name} />
                  </div>
                )}

                {/* Overlaid Real Footwear */}
                {shoe?.imageUrl && (
                  <div
                    className={`tryon-garment tryon-garment--shoe ${blendMode ? 'tryon-garment--blend' : ''}`}
                    style={{
                      transform: `translate(-50%, 0px) scale(${garmentScale})`,
                    }}
                    title={shoe.name}
                  >
                    <img src={shoe.imageUrl} alt={shoe.name} />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Try-on adjustment tools */}
            <div className="tryon-adjuster-bar">
              <button
                type="button"
                className={`tryon-adjuster-btn ${blendMode ? 'tryon-adjuster-btn--active' : ''}`}
                onClick={() => setBlendMode(!blendMode)}
                title="Toggle fabric blend onto model"
              >
                🎨 {blendMode ? 'Fabric Blend On' : 'Crisp Overlay'}
              </button>
              <button
                type="button"
                className="tryon-adjuster-btn"
                onClick={() => setGarmentScale((s) => Math.min(1.3, Number((s + 0.05).toFixed(2))))}
                title="Scale up garment sizes"
              >
                🔍+ Fit
              </button>
              <button
                type="button"
                className="tryon-adjuster-btn"
                onClick={() => setGarmentScale((s) => Math.max(0.7, Number((s - 0.05).toFixed(2))))}
                title="Scale down garment sizes"
              >
                🔍- Fit
              </button>
              <button
                type="button"
                className="tryon-adjuster-btn"
                onClick={() => setTopNudge((n) => n - 4)}
                title="Nudge top higher"
              >
                ⬆ Top
              </button>
              <button
                type="button"
                className="tryon-adjuster-btn"
                onClick={() => setTopNudge((n) => n + 4)}
                title="Nudge top lower"
              >
                ⬇ Top
              </button>
              <button
                type="button"
                className="tryon-adjuster-btn"
                onClick={() => setBottomNudge((n) => n + 4)}
                title="Nudge bottom lower"
              >
                ⬇ Bottom
              </button>
              <button
                type="button"
                className="tryon-adjuster-btn"
                onClick={handleResetAdjustments}
                title="Reset adjustments"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        )}

        {/* ─── MODE 3: EDITORIAL MAGAZINE LOOKBOOK (REAL CLOTHES FLAT-LAY) ─── */}
        {displayMode === 'editorial' && (
          <div className="editorial-collage-grid animate-fade-in">
            {/* Featured Top Card */}
            <div
              className="editorial-card editorial-card--featured"
              onClick={() => onCycleCategory && onCycleCategory('top', 1)}
              style={{ cursor: 'pointer' }}
              title="Click to cycle next top"
            >
              <span className="editorial-card__badge">Featured Top</span>
              <div className="editorial-card__img-wrap">
                {top?.imageUrl ? <img src={top.imageUrl} alt={top.name} /> : <span style={{ fontSize: '3rem' }}>👕</span>}
              </div>
              <span className="editorial-card__title">{top?.name || 'No top selected'}</span>
            </div>

            {/* Bottom Card */}
            <div
              className="editorial-card"
              onClick={() => onCycleCategory && onCycleCategory('bottom', 1)}
              style={{ cursor: 'pointer' }}
              title="Click to cycle next bottom"
            >
              <span className="editorial-card__badge">Bottom</span>
              <div className="editorial-card__img-wrap">
                {bottom?.imageUrl ? <img src={bottom.imageUrl} alt={bottom.name} /> : <span style={{ fontSize: '2.5rem' }}>👖</span>}
              </div>
              <span className="editorial-card__title">{bottom?.name || 'No bottom selected'}</span>
            </div>

            {/* Footwear Card */}
            <div
              className="editorial-card"
              onClick={() => onCycleCategory && onCycleCategory('shoe', 1)}
              style={{ cursor: 'pointer' }}
              title="Click to cycle next footwear"
            >
              <span className="editorial-card__badge">Footwear</span>
              <div className="editorial-card__img-wrap">
                {shoe?.imageUrl ? <img src={shoe.imageUrl} alt={shoe.name} /> : <span style={{ fontSize: '2.5rem' }}>👟</span>}
              </div>
              <span className="editorial-card__title">{shoe?.name || 'No footwear selected'}</span>
            </div>
          </div>
        )}

        {/* ─── MODE 4: STYLIZED 2.5D AVATAR (AVATAR RUNWAY) ─── */}
        {displayMode === 'avatar' && (
          <div className="lookbook-split-layout animate-fade-in">
            {/* Left: Animated Stylized Avatar dynamically dressed */}
            <div className="lookbook-model-col">
              <SnapchatAvatar
                avatarSettings={avatar}
                topStyle={topStyle}
                bottomStyle={bottomStyle}
                shoeStyle={shoeStyle}
                width={200}
                height={390}
              />
            </div>

            {/* Right: Live Wardrobe Rack showing the actual real closet pieces */}
            <div className="lookbook-garments-col">
              <div
                className="garment-rack-card"
                onClick={() => onCycleCategory && onCycleCategory('top', 1)}
                title="Click to cycle next top"
              >
                <div className="garment-rack-thumb">
                  {top?.imageUrl ? <img src={top.imageUrl} alt={top.name} /> : <span>👕</span>}
                </div>
                <div className="garment-rack-info">
                  <div className="garment-rack-tag">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: topStyle.color }} />
                      Top
                    </span>
                    <span className="garment-rack-cycle-arrow">▶</span>
                  </div>
                  <div className="garment-rack-name">{top?.name || 'No top'}</div>
                </div>
              </div>

              <div
                className="garment-rack-card"
                onClick={() => onCycleCategory && onCycleCategory('bottom', 1)}
                title="Click to cycle next bottom"
              >
                <div className="garment-rack-thumb">
                  {bottom?.imageUrl ? <img src={bottom.imageUrl} alt={bottom.name} /> : <span>👖</span>}
                </div>
                <div className="garment-rack-info">
                  <div className="garment-rack-tag">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: bottomStyle.color }} />
                      Bottom
                    </span>
                    <span className="garment-rack-cycle-arrow">▶</span>
                  </div>
                  <div className="garment-rack-name">{bottom?.name || 'No bottom'}</div>
                </div>
              </div>

              <div
                className="garment-rack-card"
                onClick={() => onCycleCategory && onCycleCategory('shoe', 1)}
                title="Click to cycle next shoes"
              >
                <div className="garment-rack-thumb">
                  {shoe?.imageUrl ? <img src={shoe.imageUrl} alt={shoe.name} /> : <span>👟</span>}
                </div>
                <div className="garment-rack-info">
                  <div className="garment-rack-tag">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: shoeStyle.color }} />
                      Shoes
                    </span>
                    <span className="garment-rack-cycle-arrow">▶</span>
                  </div>
                  <div className="garment-rack-name">{shoe?.name || 'No shoes'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Presentation Switcher Sub-Tabs */}
      <div className="stage-tab-switch">
        {hasPhotoAvatar ? (
          <button
            type="button"
            className={`stage-tab-btn ${displayMode === 'photo' ? 'stage-tab-btn--active' : ''}`}
            onClick={() => setDisplayMode('photo')}
          >
            📸 My Photo Muse
          </button>
        ) : (
          <button
            type="button"
            className="stage-tab-btn"
            onClick={onOpenCustomizer}
            title="Upload your personal photo to use as your model"
          >
            📸 Upload My Photo
          </button>
        )}

        <button
          type="button"
          className={`stage-tab-btn ${displayMode === 'nextgen' ? 'stage-tab-btn--active' : ''}`}
          onClick={() => setDisplayMode('nextgen')}
        >
          ✨ Runway Mannequin
        </button>

        <button
          type="button"
          className={`stage-tab-btn ${displayMode === 'tryon' ? 'stage-tab-btn--active' : ''}`}
          onClick={() => setDisplayMode('tryon')}
        >
          👗 Virtual Try-On
        </button>

        <button
          type="button"
          className={`stage-tab-btn ${displayMode === 'editorial' ? 'stage-tab-btn--active' : ''}`}
          onClick={() => setDisplayMode('editorial')}
        >
          📰 Magazine Lookbook
        </button>

        <button
          type="button"
          className={`stage-tab-btn ${displayMode === 'avatar' ? 'stage-tab-btn--active' : ''}`}
          onClick={() => setDisplayMode('avatar')}
        >
          🌟 Stylized Avatar
        </button>
      </div>

      {/* Hybrid 2D + AI Try-On Prototype Modal */}
      {showProtoModal && (
        <AvatarPrototypeShowcase
          top={top}
          bottom={bottom}
          layer={layer}
          shoe={shoe}
          accessory={accessory}
          onClose={() => setShowProtoModal(false)}
        />
      )}
    </div>
  );
}

