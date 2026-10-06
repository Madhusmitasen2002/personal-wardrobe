import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import VirtualAvatarCanvas from '../components/VirtualAvatarCanvas';
import AiStylistModal from '../components/AiStylistModal';
import AvatarCustomizerModal from '../components/AvatarCustomizerModal';
import AvatarPrototypeShowcase from '../components/AvatarPrototypeShowcase';
import './OutfitStudioPage.css';

export default function OutfitStudioPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // View mode: 'avatar' | 'stack'
  const [viewMode, setViewMode] = useState('avatar');

  // Modals state
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isProtoOpen, setIsProtoOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState({
    type: 'preset',
    presetId: 'chic-female',
    skinTone: '#f3c7a2',
    hairColor: '#1a1818',
    hairStyle: 'long',
    photoUrl: '',
  });

  // Selected items in the mannequin stack
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [layerIndex, setLayerIndex] = useState(0);
  const [shoeIndex, setShoeIndex] = useState(0);
  const [accessoryIndex, setAccessoryIndex] = useState(0);

  // Saved outfits state
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState('Casual');
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Categorized lists
  const tops = items.filter((i) => i.category === 'top');
  const bottoms = items.filter((i) => i.category === 'bottom');
  const layers = items.filter((i) => i.category === 'layer');
  const shoes = items.filter((i) => i.category === 'shoe');
  const accessories = items.filter((i) => i.category === 'accessory');

  const currentTop = tops[topIndex] || null;
  const currentBottom = bottoms[bottomIndex] || null;
  const currentLayer = layers[layerIndex] || null;
  const currentShoe = shoes[shoeIndex] || null;
  const currentAccessory = accessories[accessoryIndex] || null;


  // Fetch items, outfits, and user avatar profile
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [wardrobeRes, outfitsRes, userRes] = await Promise.all([
        api.get('/wardrobe'),
        api.get('/outfits').catch(() => ({ data: { data: [] } })),
        api.get('/auth/me').catch(() => ({ data: { data: null } })),
      ]);

      const wardrobeItems = wardrobeRes.data.data || [];
      setItems(wardrobeItems);
      setSavedOutfits(outfitsRes.data.data || []);

      if (userRes.data?.data?.avatar) {
        setUserAvatar(userRes.data.data.avatar);
      }

      // If preselected item passed in query params (e.g. ?item=id)
      const queryItemId = searchParams.get('item');
      if (queryItemId) {
        const found = wardrobeItems.find((i) => i._id === queryItemId);
        if (found) {
          if (found.category === 'top') {
            const idx = wardrobeItems.filter((i) => i.category === 'top').findIndex((i) => i._id === queryItemId);
            if (idx !== -1) setTopIndex(idx);
          } else if (found.category === 'bottom') {
            const idx = wardrobeItems.filter((i) => i.category === 'bottom').findIndex((i) => i._id === queryItemId);
            if (idx !== -1) setBottomIndex(idx);
          } else if (found.category === 'layer') {
            const idx = wardrobeItems.filter((i) => i.category === 'layer').findIndex((i) => i._id === queryItemId);
            if (idx !== -1) setLayerIndex(idx);
          } else if (found.category === 'shoe') {
            const idx = wardrobeItems.filter((i) => i.category === 'shoe').findIndex((i) => i._id === queryItemId);
            if (idx !== -1) setShoeIndex(idx);
          }
        }
      }

      // Check if instructed to auto-open AI Stylist or Prototype modal
      if (searchParams.get('openStylist') === 'true') {
        setIsStylistOpen(true);
      } else if (searchParams.get('openProto') === 'true') {
        setIsProtoOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load studio data');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Shuffle / Surprise Me
  const handleShuffle = () => {
    if (tops.length > 0) {
      setTopIndex(Math.floor(Math.random() * tops.length));
    }
    if (bottoms.length > 0) {
      setBottomIndex(Math.floor(Math.random() * bottoms.length));
    }
    if (layers.length > 0) {
      setLayerIndex(Math.floor(Math.random() * layers.length));
    }
    if (shoes.length > 0) {
      setShoeIndex(Math.floor(Math.random() * shoes.length));
    }
    if (accessories.length > 0) {
      setAccessoryIndex(Math.floor(Math.random() * accessories.length));
    }
  };

  // Navigators
  const cycleItem = (category, direction) => {
    if (category === 'top' && tops.length > 0) {
      setTopIndex((prev) => (prev + direction + tops.length) % tops.length);
    } else if (category === 'bottom' && bottoms.length > 0) {
      setBottomIndex((prev) => (prev + direction + bottoms.length) % bottoms.length);
    } else if (category === 'layer' && layers.length > 0) {
      setLayerIndex((prev) => (prev + direction + layers.length) % layers.length);
    } else if (category === 'shoe' && shoes.length > 0) {
      setShoeIndex((prev) => (prev + direction + shoes.length) % shoes.length);
    } else if (category === 'accessory' && accessories.length > 0) {
      setAccessoryIndex((prev) => (prev + direction + accessories.length) % accessories.length);
    }
  };

  // Save outfit
  const handleSaveOutfit = async (e) => {
    e.preventDefault();
    if (!outfitName.trim()) {
      alert('Please give your outfit a name (e.g. Summer Chic)');
      return;
    }
    if (!currentTop && !currentBottom && !currentLayer && !currentShoe) {
      alert('Select at least one piece to save an outfit');
      return;
    }

    setSaving(true);
    setSaveSuccessMsg('');
    try {
      const res = await api.post('/outfits', {
        name: outfitName.trim(),
        occasion,
        top: currentTop?._id || null,
        bottom: currentBottom?._id || null,
        layer: currentLayer?._id || null,
        shoe: currentShoe?._id || null,
        accessories: currentAccessory ? [currentAccessory._id] : [],
      });

      setSavedOutfits((prev) => [res.data.data, ...prev]);
      setOutfitName('');
      setSaveSuccessMsg('Outfit saved to your collection!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save outfit');
    } finally {
      setSaving(false);
    }
  };


  // Load a saved outfit into canvas
  const handleLoadOutfit = (outfit) => {
    if (outfit.top) {
      const idx = tops.findIndex((t) => t._id === outfit.top._id || t._id === outfit.top);
      if (idx !== -1) setTopIndex(idx);
    }
    if (outfit.bottom) {
      const idx = bottoms.findIndex((b) => b._id === outfit.bottom._id || b._id === outfit.bottom);
      if (idx !== -1) setBottomIndex(idx);
    }
    if (outfit.shoe) {
      const idx = shoes.findIndex((s) => s._id === outfit.shoe._id || s._id === outfit.shoe);
      if (idx !== -1) setShoeIndex(idx);
    }
  };

  // Apply outfit from AI Stylist
  const handleApplyStylistOutfit = (look) => {
    if (look.top) {
      const idx = tops.findIndex((t) => t._id === look.top._id);
      if (idx !== -1) setTopIndex(idx);
    }
    if (look.bottom) {
      const idx = bottoms.findIndex((b) => b._id === look.bottom._id);
      if (idx !== -1) setBottomIndex(idx);
    }
    if (look.layer) {
      const idx = layers.findIndex((l) => l._id === look.layer._id);
      if (idx !== -1) setLayerIndex(idx);
    }
    if (look.shoe) {
      const idx = shoes.findIndex((s) => s._id === look.shoe._id);
      if (idx !== -1) setShoeIndex(idx);
    }
    if (look.accessories && look.accessories[0]) {
      const idx = accessories.findIndex((a) => a._id === look.accessories[0]._id);
      if (idx !== -1) setAccessoryIndex(idx);
    }
    setOutfitName(look.outfitName);
    setOccasion(look.occasion || 'Curated Look');
    setViewMode('avatar');
  };

  // Share current outfit
  const handleShareOutfit = async () => {
    const summary = [
      `✨ Look: ${outfitName || 'Curated Ensemble'} (${occasion})`,
      currentTop ? `• Top: ${currentTop.name}` : null,
      currentBottom ? `• Bottom: ${currentBottom.name}` : null,
      currentLayer ? `• Outerwear: ${currentLayer.name}` : null,
      currentShoe ? `• Footwear: ${currentShoe.name}` : null,
      currentAccessory ? `• Accent: ${currentAccessory.name}` : null,
      `Styled on Maddie's Digital Wardrobe Studio`,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: outfitName || 'My Curated Look',
          text: summary,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to clipboard if cancelled or rejected
      }
    }

    try {
      await navigator.clipboard.writeText(summary);
      setSaveSuccessMsg('📋 Look copied to clipboard! Ready to share.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('Could not copy to clipboard');
    }
  };

  // Delete saved outfit
  const handleDeleteOutfit = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved outfit?')) return;
    try {
      await api.delete(`/outfits/${id}`);
      setSavedOutfits((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete outfit');
    }
  };

  if (loading) {
    return (
      <div className="studio">
        <div style={{ textAlign: 'center', padding: '120px 0' }}>
          <LoadingSpinner size={36} />
          <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading Outfit Studio & Dressing Room...</p>
        </div>
      </div>
    );
  }

  const hasAnyItems = items.length > 0;

  return (
    <div className="studio">
      {/* Header */}
      <div className="studio__header animate-fade-in">
        <div>
          <h1 className="studio__title">
            Outfit <span className="studio__title-gradient">Studio & Dressing Room</span>
          </h1>
          <p className="studio__subtitle">
            Mix, match, and visualize looks live on your virtual avatar with AI guidance.
          </p>
        </div>
        <div className="studio__header-actions">
          {/* Next-Gen Studio Prototype Button */}
          <button
            type="button"
            className="studio__btn studio__btn--primary"
            onClick={() => setIsProtoOpen(true)}
            title="Launch Hybrid 2D Mannequin + AI Photo Try-On Studio"
            style={{ background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))', boxShadow: '0 4px 20px var(--accent-glow)' }}
          >
            Try-On Canvas
          </button>

          {/* Ask Stylist Button */}
          <button
            type="button"
            className="studio__btn studio__btn--secondary"
            onClick={() => setIsStylistOpen(true)}
            title="Ask Stylist for recommendations"
          >
            Ask Stylist
          </button>

          {/* Customize Avatar Button */}
          <button
            type="button"
            className="studio__btn studio__btn--secondary"
            onClick={() => setIsAvatarModalOpen(true)}
            title="Customize avatar profile"
          >
            Avatar Profile
          </button>

          {/* Shuffle Button */}
          <button
            type="button"
            className="studio__btn studio__btn--secondary"
            onClick={handleShuffle}
            disabled={!hasAnyItems}
            title="Randomize outfit combination"
          >
            Shuffle
          </button>

          <Link to="/upload" className="studio__btn studio__btn--secondary">
            Upload Item
          </Link>
        </div>
      </div>

      {error && (
        <div className="auth-card__error animate-fade-in" style={{ marginBottom: 24 }}>
          {error}
        </div>
      )}

      {!hasAnyItems ? (
        <div className="wardrobe__empty animate-fade-in">
          <h3>Your wardrobe is currently empty</h3>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="studio__btn studio__btn--primary"
              onClick={() => setIsStylistOpen(true)}
              style={{ background: 'var(--text-primary)' }}
            >
              Ask Stylist
            </button>
            <button
              type="button"
              className="studio__btn studio__btn--secondary"
              onClick={() => setIsProtoOpen(true)}
            >
              Try-On Studio
            </button>
            <Link to="/upload" className="studio__btn studio__btn--secondary">
              Upload Garment
            </Link>
          </div>
        </div>

      ) : (
        <div className="studio__layout">
          {/* Left: Interactive Canvas (Avatar / Stack) */}
          <div className="studio__canvas-card animate-slide-up">
            <div className="studio__canvas-toolbar">
              {/* Segmented View Mode Switcher */}
              <div className="studio__mode-switcher">
                <button
                  type="button"
                  className={`studio__mode-btn ${viewMode === 'avatar' ? 'studio__mode-btn--active' : ''}`}
                  onClick={() => setViewMode('avatar')}
                >
                  🧍 Avatar Runway
                </button>
                <button
                  type="button"
                  className={`studio__mode-btn ${viewMode === 'stack' ? 'studio__mode-btn--active' : ''}`}
                  onClick={() => setViewMode('stack')}
                >
                  👕 Stack View
                </button>
              </div>

              <button
                className="studio__btn studio__btn--secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={handleShuffle}
              >
                🔄 Shuffle Look
              </button>
            </div>

            {/* VIEW MODE 1: AVATAR FITTING ROOM */}
            {viewMode === 'avatar' ? (
              <div>
                <VirtualAvatarCanvas
                  avatar={userAvatar}
                  top={currentTop}

                  bottom={currentBottom}
                  layer={currentLayer}
                  shoe={currentShoe}
                  accessory={currentAccessory}
                  onOpenCustomizer={() => setIsAvatarModalOpen(true)}
                  onCycleCategory={cycleItem}
                />

                {/* Quick cycle selectors under the avatar */}
                <div className="studio__quick-selectors">
                  {/* Top quick cycle */}
                  <div className="studio__quick-slot">
                    <div className="studio__quick-slot-label">
                      <span>Top</span>
                      <span>{tops.length > 0 ? `${topIndex + 1}/${tops.length}` : '0'}</span>
                    </div>
                    <div className="studio__quick-nav-row">
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('top', -1)}
                        disabled={tops.length <= 1}
                      >
                        ◀
                      </button>
                      <span className="studio__quick-name">{currentTop?.name || 'None'}</span>
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('top', 1)}
                        disabled={tops.length <= 1}
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  {/* Layer quick cycle */}
                  <div className="studio__quick-slot">
                    <div className="studio__quick-slot-label">
                      <span>Outer Layer</span>
                      <span>{layers.length > 0 ? `${layerIndex + 1}/${layers.length}` : '0'}</span>
                    </div>
                    <div className="studio__quick-nav-row">
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('layer', -1)}
                        disabled={layers.length <= 1}
                      >
                        ◀
                      </button>
                      <span className="studio__quick-name">{currentLayer?.name || 'None'}</span>
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('layer', 1)}
                        disabled={layers.length <= 1}
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  {/* Bottom quick cycle */}
                  <div className="studio__quick-slot">
                    <div className="studio__quick-slot-label">
                      <span>Bottom</span>
                      <span>{bottoms.length > 0 ? `${bottomIndex + 1}/${bottoms.length}` : '0'}</span>
                    </div>
                    <div className="studio__quick-nav-row">
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('bottom', -1)}
                        disabled={bottoms.length <= 1}
                      >
                        ◀
                      </button>
                      <span className="studio__quick-name">{currentBottom?.name || 'None'}</span>
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('bottom', 1)}
                        disabled={bottoms.length <= 1}
                      >
                        ▶
                      </button>
                    </div>
                  </div>

                  {/* Shoe quick cycle */}
                  <div className="studio__quick-slot">
                    <div className="studio__quick-slot-label">
                      <span>Shoes</span>
                      <span>{shoes.length > 0 ? `${shoeIndex + 1}/${shoes.length}` : '0'}</span>
                    </div>
                    <div className="studio__quick-nav-row">
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('shoe', -1)}
                        disabled={shoes.length <= 1}
                      >
                        ◀
                      </button>
                      <span className="studio__quick-name">{currentShoe?.name || 'None'}</span>
                      <button
                        className="avatar-nudge-btn"
                        onClick={() => cycleItem('shoe', 1)}
                        disabled={shoes.length <= 1}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            ) : (
              /* VIEW MODE 2: CLASSIC STACK VIEW */
              <div className="studio__slots">
                {/* TOP SLOT */}
                <div className={`studio-slot ${currentTop ? 'studio-slot--filled' : ''}`}>
                  <div className="studio-slot__header">
                    <span className="studio-slot__label">
                      <span>👕</span> Top
                    </span>
                    <span className="studio-slot__counter">
                      {tops.length > 0 ? `${topIndex + 1} of ${tops.length}` : '0 available'}
                    </span>
                  </div>
                  <div className="studio-slot__body">
                    <button
                      className="studio-slot__nav"
                      onClick={() => cycleItem('top', -1)}
                      disabled={tops.length <= 1}
                      aria-label="Previous Top"
                    >
                      ◀
                    </button>
                    <div className="studio-slot__preview">
                      {currentTop ? (
                        <>
                          <img src={currentTop.imageUrl} alt={currentTop.name} className="studio-slot__img" />
                          <div className="studio-slot__item-title">{currentTop.name}</div>
                        </>
                      ) : (
                        <div className="studio-slot__empty">
                          <span className="studio-slot__empty-icon">👕</span>
                          <span>No tops uploaded yet</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="studio-slot__nav"
                      onClick={() => cycleItem('top', 1)}
                      disabled={tops.length <= 1}
                      aria-label="Next Top"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {/* BOTTOM SLOT */}
                <div className={`studio-slot ${currentBottom ? 'studio-slot--filled' : ''}`}>
                  <div className="studio-slot__header">
                    <span className="studio-slot__label">
                      <span>👖</span> Bottom
                    </span>
                    <span className="studio-slot__counter">
                      {bottoms.length > 0 ? `${bottomIndex + 1} of ${bottoms.length}` : '0 available'}
                    </span>
                  </div>
                  <div className="studio-slot__body">
                    <button
                      className="studio-slot__nav"
                      onClick={() => cycleItem('bottom', -1)}
                      disabled={bottoms.length <= 1}
                      aria-label="Previous Bottom"
                    >
                      ◀
                    </button>
                    <div className="studio-slot__preview">
                      {currentBottom ? (
                        <>
                          <img src={currentBottom.imageUrl} alt={currentBottom.name} className="studio-slot__img" />
                          <div className="studio-slot__item-title">{currentBottom.name}</div>
                        </>
                      ) : (
                        <div className="studio-slot__empty">
                          <span className="studio-slot__empty-icon">👖</span>
                          <span>No bottoms uploaded yet</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="studio-slot__nav"
                      onClick={() => cycleItem('bottom', 1)}
                      disabled={bottoms.length <= 1}
                      aria-label="Next Bottom"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {/* SHOE SLOT */}
                <div className={`studio-slot ${currentShoe ? 'studio-slot--filled' : ''}`}>
                  <div className="studio-slot__header">
                    <span className="studio-slot__label">
                      <span>👟</span> Shoes
                    </span>
                    <span className="studio-slot__counter">
                      {shoes.length > 0 ? `${shoeIndex + 1} of ${shoes.length}` : '0 available'}
                    </span>
                  </div>
                  <div className="studio-slot__body">
                    <button
                      className="studio-slot__nav"
                      onClick={() => cycleItem('shoe', -1)}
                      disabled={shoes.length <= 1}
                      aria-label="Previous Shoes"
                    >
                      ◀
                    </button>
                    <div className="studio-slot__preview">
                      {currentShoe ? (
                        <>
                          <img src={currentShoe.imageUrl} alt={currentShoe.name} className="studio-slot__img" />
                          <div className="studio-slot__item-title">{currentShoe.name}</div>
                        </>
                      ) : (
                        <div className="studio-slot__empty">
                          <span className="studio-slot__empty-icon">👟</span>
                          <span>No shoes uploaded yet</span>
                        </div>
                      )}
                    </div>
                    <button
                      className="studio-slot__nav"
                      onClick={() => cycleItem('shoe', 1)}
                      disabled={shoes.length <= 1}
                      aria-label="Next Shoes"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Outfit Section */}
            <form onSubmit={handleSaveOutfit} className="studio__save-box">
              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Give this outfit a name (e.g. Sunny Weekend)"
                className="studio__input"
              />
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="studio__select"
              >
                <option value="Casual">Casual</option>
                <option value="Work / Office">Work / Office</option>
                <option value="Date Night">Date Night</option>
                <option value="Party">Party</option>
                <option value="Workout">Workout</option>
                <option value="Formal">Formal</option>
              </select>
              <button
                type="submit"
                className="studio__btn studio__btn--primary"
                disabled={saving || (!currentTop && !currentBottom && !currentShoe)}
              >
                {saving ? 'Saving...' : '💾 Save Outfit'}
              </button>
              <button
                type="button"
                className="studio__btn studio__btn--secondary"
                onClick={handleShareOutfit}
                disabled={!currentTop && !currentBottom && !currentShoe}
                title="Copy styled look summary or share via native device share"
              >
                📤 Share Look
              </button>
            </form>

            {saveSuccessMsg && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(34, 197, 94, 0.1)',
                  color: 'var(--success)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                ✨ {saveSuccessMsg}
              </div>
            )}
          </div>

          {/* Right: Saved Outfits Sidebar */}
          <div className="studio__sidebar animate-slide-up">
            <div className="studio__sidebar-title">
              <span>Saved Looks</span>
              <span className="studio__sidebar-badge">{savedOutfits.length}</span>
            </div>
            <p className="studio__sidebar-desc">
              Your favorite saved combinations. Click any look to load it on the canvas.
            </p>

            {savedOutfits.length === 0 ? (
              <div className="studio__sidebar-empty">
                <div className="studio__sidebar-empty-icon">👔</div>
                <p>No outfits saved yet.</p>
                <p style={{ marginTop: 4 }}>Combine pieces on the left and hit "Save Outfit"!</p>
              </div>
            ) : (
              <div className="studio__outfits-list">
                {savedOutfits.map((outfit) => (
                  <div
                    key={outfit._id}
                    className="saved-outfit-card"
                    onClick={() => handleLoadOutfit(outfit)}
                    title="Click to view on canvas"
                  >
                    <div className="saved-outfit-card__header">
                      <span className="saved-outfit-card__name">{outfit.name}</span>
                      <span className="saved-outfit-card__occasion">{outfit.occasion}</span>
                    </div>

                    <div className="saved-outfit-card__thumbnails">
                      <div className="saved-outfit-card__thumb">
                        {outfit.top?.imageUrl ? (
                          <img src={outfit.top.imageUrl} alt="Top" />
                        ) : (
                          <span className="saved-outfit-card__thumb-empty">—</span>
                        )}
                      </div>
                      <div className="saved-outfit-card__thumb">
                        {outfit.bottom?.imageUrl ? (
                          <img src={outfit.bottom.imageUrl} alt="Bottom" />
                        ) : (
                          <span className="saved-outfit-card__thumb-empty">—</span>
                        )}
                      </div>
                      <div className="saved-outfit-card__thumb">
                        {outfit.shoe?.imageUrl ? (
                          <img src={outfit.shoe.imageUrl} alt="Shoe" />
                        ) : (
                          <span className="saved-outfit-card__thumb-empty">—</span>
                        )}
                      </div>
                    </div>

                    <div className="saved-outfit-card__actions">
                      <button
                        className="saved-outfit-card__load-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadOutfit(outfit);
                        }}
                      >
                        Load to Runway ↗
                      </button>
                      <button
                        className="saved-outfit-card__delete-btn"
                        onClick={(e) => handleDeleteOutfit(e, outfit._id)}
                        title="Delete saved outfit"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Stylist Modal */}
      <AiStylistModal
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        onApplyOutfit={handleApplyStylistOutfit}
        onSaveOutfit={(newLook) => setSavedOutfits((prev) => [newLook, ...prev])}
      />

      {/* Avatar Customizer Modal */}
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={userAvatar}
        onAvatarUpdated={(newAvatar) => setUserAvatar(newAvatar)}
      />

      {/* Hybrid 2D + AI Try-On Prototype Modal */}
      {isProtoOpen && (
        <AvatarPrototypeShowcase
          top={currentTop}
          bottom={currentBottom}
          layer={currentLayer}
          shoe={currentShoe}
          accessory={currentAccessory}
          onClose={() => setIsProtoOpen(false)}
        />
      )}
    </div>
  );
}

