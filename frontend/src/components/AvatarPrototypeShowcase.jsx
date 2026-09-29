import { useState } from 'react';
import FashionMannequinAvatar from './FashionMannequinAvatar';
import LoadingSpinner from './LoadingSpinner';
import './AvatarPrototypeShowcase.css';

const SKIN_TONES = [
  { name: 'Fair Porcelain', hex: '#ffe3d1' },
  { name: 'Warm Honey', hex: '#f3c7a2' },
  { name: 'Golden Almond', hex: '#d99f6f' },
  { name: 'Rich Chestnut', hex: '#a26a42' },
  { name: 'Deep Espresso', hex: '#543625' },
];

const LIGHTING_PRESETS = [
  { id: 'runway', label: '✨ Runway Spotlight' },
  { id: 'golden', label: '🌅 Golden Hour' },
  { id: 'editorial', label: '📸 Moody Editorial' },
  { id: 'studio', label: '💡 Clean Studio' },
];

export default function AvatarPrototypeShowcase({
  top,
  bottom,
  layer,
  shoe,
  accessory,
  onClose,
}) {
  // Proportions
  const [shoulders, setShoulders] = useState(50);
  const [waist, setWaist] = useState(50);
  const [hips, setHips] = useState(50);
  const [skinTone, setSkinTone] = useState('#f3c7a2');
  const [lighting, setLighting] = useState('runway');

  // Hybrid Mode: '2d' (Instant Studio) | 'ai' (On-demand AI Photo) | 'compare' (Before/After)
  const [activeTab, setActiveTab] = useState('2d');

  // On-demand AI Photo Try-on state (cached + rate-limited)
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState(null);
  const [aiCooldown, setAiCooldown] = useState(0);

  // Before / After look state
  const [compareSplit, setCompareSplit] = useState(50);

  const handleGenerateAiPhoto = () => {
    if (aiCooldown > 0 || aiGenerating) return;

    setAiGenerating(true);
    // Simulate high-fidelity AI diffusion generation pipeline (cached & rate limited)
    setTimeout(() => {
      // High-fashion photo generation result
      setAiGeneratedImage(
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80'
      );
      setAiGenerating(false);

      // 30-second rate-limit cooldown
      setAiCooldown(30);
      const timer = setInterval(() => {
        setAiCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2200);
  };

  return (
    <div className="avatar-proto-overlay animate-fade-in">
      <div className="avatar-proto-card animate-slide-up">
        {/* Header */}
        <div className="avatar-proto-header">
          <div className="avatar-proto-title-group">
            <span className="avatar-proto-badge">Phase 1 & 2 Prototype</span>
            <h2 className="avatar-proto-title">Next-Gen Hybrid Fashion Studio</h2>
            <p className="avatar-proto-desc">
              Instant 60 FPS parametric mannequin + On-demand photorealistic AI try-on
            </p>
          </div>
          {onClose && (
            <button type="button" className="avatar-proto-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="avatar-proto-nav">
          <button
            type="button"
            className={`proto-nav-btn ${activeTab === '2d' ? 'proto-nav-btn--active' : ''}`}
            onClick={() => setActiveTab('2d')}
          >
            👗 Instant 2D Studio (Zero Latency)
          </button>
          <button
            type="button"
            className={`proto-nav-btn ${activeTab === 'ai' ? 'proto-nav-btn--active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            📸 On-Demand AI Photo Model
          </button>
          <button
            type="button"
            className={`proto-nav-btn ${activeTab === 'compare' ? 'proto-nav-btn--active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            ⚖️ Before / After Split Compare
          </button>
        </div>

        {/* Main Stage Grid */}
        <div className="avatar-proto-body">
          {/* Visual Showcase Stage */}
          <div className="avatar-proto-stage">
            {activeTab === '2d' && (
              <div className="stage-canvas-wrap animate-fade-in">
                <FashionMannequinAvatar
                  proportions={{ shoulders, waist, hips, heightScale: 1.0 }}
                  skinTone={skinTone}
                  activeLighting={lighting}
                  top={top}
                  bottom={bottom}
                  layer={layer}
                  shoe={shoe}
                  accessory={accessory}
                  width={260}
                  height={480}
                />
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="stage-ai-wrap animate-fade-in">
                {aiGeneratedImage ? (
                  <div className="ai-photo-result animate-fade-in">
                    <img src={aiGeneratedImage} alt="AI Photo Try-On" className="ai-photo-img" />
                    <div className="ai-photo-badge">
                      <span>✨ Ultra-Realistic Runway Render · Cached</span>
                    </div>
                  </div>
                ) : (
                  <div className="ai-photo-empty">
                    <div className="ai-photo-icon">📸</div>
                    <h3>On-Demand Photorealistic Try-On</h3>
                    <p>
                      Combines your coordinated garments onto a photorealistic runway model with studio lighting.
                    </p>
                    <button
                      type="button"
                      className="upload-btn upload-btn--primary"
                      onClick={handleGenerateAiPhoto}
                      disabled={aiGenerating || aiCooldown > 0}
                    >
                      {aiGenerating ? (
                        <>
                          <LoadingSpinner size={18} />
                          Rendering AI Model...
                        </>
                      ) : aiCooldown > 0 ? (
                        `Rate-limit Cooldown (${aiCooldown}s)`
                      ) : (
                        '✨ Generate Photorealistic Model'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="stage-compare-wrap animate-fade-in">
                <div className="compare-split-container">
                  {/* Left Side: Casual Baseline */}
                  <div
                    className="compare-split-pane compare-split-pane--left"
                    style={{ clipPath: `inset(0 ${100 - compareSplit}% 0 0)` }}
                  >
                    <FashionMannequinAvatar
                      proportions={{ shoulders, waist, hips, heightScale: 1.0 }}
                      skinTone={skinTone}
                      activeLighting="studio"
                      top={null}
                      bottom={null}
                      layer={null}
                      shoe={null}
                      width={240}
                      height={460}
                    />
                    <div className="compare-badge compare-badge--before">Look A: Baseline</div>
                  </div>

                  {/* Right Side: Full Coordinated Styled Look */}
                  <div
                    className="compare-split-pane compare-split-pane--right"
                    style={{ clipPath: `inset(0 0 0 ${compareSplit}%)` }}
                  >
                    <FashionMannequinAvatar
                      proportions={{ shoulders, waist, hips, heightScale: 1.0 }}
                      skinTone={skinTone}
                      activeLighting="runway"
                      top={top}
                      bottom={bottom}
                      layer={layer}
                      shoe={shoe}
                      accessory={accessory}
                      width={240}
                      height={460}
                    />
                    <div className="compare-badge compare-badge--after">Look B: Coordinated Style</div>
                  </div>

                  {/* Draggable Divider */}
                  <div className="compare-divider" style={{ left: `${compareSplit}%` }}>
                    <div className="compare-handle">⇄</div>
                  </div>
                </div>

                <div className="compare-slider-control">
                  <span>Look A (Base)</span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={compareSplit}
                    onChange={(e) => setCompareSplit(Number(e.target.value))}
                    className="compare-range-input"
                  />
                  <span>Look B (Full Outfit)</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Customization Controls */}
          <div className="avatar-proto-controls">
            <h3 className="proto-panel-title">Mannequin Anatomical Controls</h3>

            {/* Shoulders */}
            <div className="control-slider-group">
              <div className="control-slider-header">
                <span>Shoulder Width</span>
                <span>{shoulders < 45 ? 'Petite' : shoulders > 60 ? 'Broad / Athletic' : 'Balanced'}</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={shoulders}
                onChange={(e) => setShoulders(Number(e.target.value))}
                className="proto-slider"
              />
            </div>

            {/* Waist */}
            <div className="control-slider-group">
              <div className="control-slider-header">
                <span>Waist Definition</span>
                <span>{waist < 40 ? 'Cinched / Hourglass' : waist > 60 ? 'Relaxed / Straight' : 'Tailored'}</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
                className="proto-slider"
              />
            </div>

            {/* Hips */}
            <div className="control-slider-group">
              <div className="control-slider-header">
                <span>Hip Proportions</span>
                <span>{hips < 45 ? 'Slender' : hips > 60 ? 'Curvy' : 'Proportional'}</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={hips}
                onChange={(e) => setHips(Number(e.target.value))}
                className="proto-slider"
              />
            </div>

            {/* Skin Tone Swatches */}
            <div className="control-swatch-group">
              <span className="proto-panel-subtitle">Skin Tone & Undertone</span>
              <div className="proto-swatches">
                {SKIN_TONES.map((st) => (
                  <button
                    key={st.hex}
                    type="button"
                    className={`proto-swatch-circle ${skinTone === st.hex ? 'proto-swatch-circle--active' : ''}`}
                    style={{ backgroundColor: st.hex }}
                    onClick={() => setSkinTone(st.hex)}
                    title={st.name}
                  />
                ))}
              </div>
            </div>

            {/* Studio Lighting */}
            <div className="control-lighting-group">
              <span className="proto-panel-subtitle">Studio Ambience</span>
              <div className="proto-lighting-grid">
                {LIGHTING_PRESETS.map((lp) => (
                  <button
                    key={lp.id}
                    type="button"
                    className={`proto-light-btn ${lighting === lp.id ? 'proto-light-btn--active' : ''}`}
                    onClick={() => setLighting(lp.id)}
                  >
                    {lp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layers Status Summary */}
            <div className="proto-layers-summary">
              <span className="proto-panel-subtitle">Active Anchored Slots</span>
              <div className="proto-layer-tags">
                <span className={`layer-pill ${top ? 'layer-pill--active' : ''}`}>
                  Top: {top?.name ? top.name.slice(0, 15) : 'None'}
                </span>
                <span className={`layer-pill ${bottom ? 'layer-pill--active' : ''}`}>
                  Bottom: {bottom?.name ? bottom.name.slice(0, 15) : 'None'}
                </span>
                <span className={`layer-pill ${layer ? 'layer-pill--active' : ''}`}>
                  Outer Layer: {layer?.name ? layer.name.slice(0, 15) : 'None'}
                </span>
                <span className={`layer-pill ${shoe ? 'layer-pill--active' : ''}`}>
                  Footwear: {shoe?.name ? shoe.name.slice(0, 15) : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
