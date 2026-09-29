import { useState, useRef } from 'react';
import api from '../api/axios';
import LoadingSpinner from './LoadingSpinner';
import SnapchatAvatar from './SnapchatAvatar';
import { removeBackgroundFromFile } from '../utils/backgroundRemoval';
import './AvatarCustomizerModal.css';

const SKIN_TONES = [
  { name: 'Fair Light', color: '#ffdfc4' },
  { name: 'Warm Honey', color: '#f3c7a2' },
  { name: 'Golden Sand', color: '#d99f6f' },
  { name: 'Chestnut Bronze', color: '#a26a42' },
  { name: 'Deep Espresso', color: '#593826' },
];

const HAIR_COLORS = [
  { name: 'Jet Black', color: '#1a1818' },
  { name: 'Espresso Brown', color: '#4a2c1b' },
  { name: 'Honey Blonde', color: '#d4af37' },
  { name: 'Velvet Auburn', color: '#8b261e' },
  { name: 'Pastel Lilac', color: '#c084fc' },
];

const HAIR_STYLES = [
  { id: 'long', label: 'Beach Waves' },
  { id: 'short', label: 'Chic Bob' },
  { id: 'bun', label: 'Topknot Bun' },
  { id: 'fade', label: 'Sharp Quiff' },
  { id: 'afro', label: 'Natural Afro' },
];

const PRESETS = [
  { id: 'chic-female', label: 'Runway Silhouette', gender: 'female' },
  { id: 'modern-male', label: 'Structured Tailored', gender: 'male' },
  { id: 'neutral-mannequin', label: 'Fashion Mannequin', gender: 'neutral' },
];

export default function AvatarCustomizerModal({ isOpen, onClose, currentAvatar, onAvatarUpdated }) {
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState(currentAvatar?.type === 'photo' ? 'photo' : 'preset');

  // Customizer state
  const [presetId, setPresetId] = useState(currentAvatar?.presetId || 'chic-female');
  const [skinTone, setSkinTone] = useState(currentAvatar?.skinTone || '#f3c7a2');
  const [hairColor, setHairColor] = useState(currentAvatar?.hairColor || '#1a1818');
  const [hairStyle, setHairStyle] = useState(currentAvatar?.hairStyle || 'long');

  // Photo state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(currentAvatar?.photoUrl || '');
  const [autoCutout, setAutoCutout] = useState(true);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));

    if (autoCutout) {
      setProcessingPhoto(true);
      try {
        const cutout = await removeBackgroundFromFile(f);
        if (cutout && cutout.success) {
          setPhotoFile(cutout.file);
          setPhotoPreview(cutout.previewUrl);
        }
      } catch (err) {
        console.warn('Avatar cutout fallback:', err);
      } finally {
        setProcessingPhoto(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'photo' && photoFile) {
        // Upload photo to backend
        const formData = new FormData();
        formData.append('photo', photoFile);
        const res = await api.post('/auth/avatar/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (onAvatarUpdated) onAvatarUpdated(res.data.data.avatar);
      } else {
        // Update preset settings
        const updatedAvatar = {
          type: tab === 'photo' && photoPreview ? 'photo' : 'preset',
          presetId,
          skinTone,
          hairColor,
          hairStyle,
          photoUrl: photoPreview,
          avatarUrl: photoPreview,
        };
        const res = await api.patch('/auth/avatar', { avatar: updatedAvatar });
        if (onAvatarUpdated) onAvatarUpdated(res.data.data.avatar);
      }
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save avatar settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal__header">
          <h2 className="avatar-modal__title">Virtual Avatar Studio</h2>
          <button className="stylist-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="avatar-modal__body">
          {/* Avatar Live Preview Stand */}
          <div className="avatar-stand">
            <div className="avatar-stand__figure">
              {tab === 'photo' && photoPreview ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={photoPreview}
                    alt="Custom Avatar"
                    style={{
                      maxHeight: '220px',
                      maxWidth: '150px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      border: '2px solid var(--border-accent)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-end)', marginTop: 8, fontWeight: 600 }}>
                    ✨ Personal Muse Photo
                  </span>
                </div>
              ) : (
                <SnapchatAvatar
                  avatarSettings={{ skinTone, hairColor, hairStyle, presetId }}
                  topStyle={{ type: 'blazer', color: '#7c3aed' }}
                  bottomStyle={{ type: 'jeans', color: '#1e3a8a' }}
                  shoeStyle={{ type: 'sneakers', color: '#ffffff' }}
                  width={150}
                  height={270}
                />
              )}
            </div>
            <div className="avatar-stand__pedestal" />
          </div>

          {/* Customizer Tabs & Options */}
          <div className="avatar-controls">
            <div className="avatar-tab-nav">
              <button
                type="button"
                className={`avatar-tab-btn ${tab === 'preset' ? 'avatar-tab-btn--active' : ''}`}
                onClick={() => setTab('preset')}
              >
                🌟 Snapchat Bitmoji Avatar
              </button>
              <button
                type="button"
                className={`avatar-tab-btn ${tab === 'photo' ? 'avatar-tab-btn--active' : ''}`}
                onClick={() => setTab('photo')}
              >
                📸 Personal Muse Photo
              </button>
            </div>

            {tab === 'preset' ? (
              <>
                <div>
                  <span className="stylist-modal__section-label">Mannequin Silhouette</span>
                  <div className="avatar-presets">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`avatar-preset-btn ${presetId === p.id ? 'avatar-preset-btn--active' : ''}`}
                        onClick={() => setPresetId(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="stylist-modal__section-label">Skin Tone</span>
                  <div className="avatar-palette">
                    {SKIN_TONES.map((st) => (
                      <div
                        key={st.color}
                        className={`avatar-swatch ${skinTone === st.color ? 'avatar-swatch--active' : ''}`}
                        style={{ backgroundColor: st.color }}
                        onClick={() => setSkinTone(st.color)}
                        title={st.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="stylist-modal__section-label">Hair Color</span>
                  <div className="avatar-palette">
                    {HAIR_COLORS.map((hc) => (
                      <div
                        key={hc.color}
                        className={`avatar-swatch ${hairColor === hc.color ? 'avatar-swatch--active' : ''}`}
                        style={{ backgroundColor: hc.color }}
                        onClick={() => setHairColor(hc.color)}
                        title={hc.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="stylist-modal__section-label">Hair Style</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {HAIR_STYLES.map((hs) => (
                      <button
                        key={hs.id}
                        type="button"
                        className={`avatar-tab-btn ${hairStyle === hs.id ? 'avatar-tab-btn--active' : ''}`}
                        onClick={() => setHairStyle(hs.id)}
                      >
                        {hs.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <span className="stylist-modal__section-label">Upload Selfie / Full-Body Photo</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Upload a photo of yourself. The studio will frame you as the personal muse of your closet and style coordinated outfits next to you on your runway!
                </p>

                <div
                  className="avatar-photo-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📸</div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    Click or drag photo to upload
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PNG, JPG · Seamless Runway Display
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </div>

                {processingPhoto && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-end)', fontSize: '0.85rem' }}>
                    <LoadingSpinner size={16} /> Refining photo preview...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="avatar-modal__footer">
          <button type="button" className="stylist-card__action-btn stylist-card__action-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="stylist-card__action-btn stylist-card__action-btn--primary"
            onClick={handleSave}
            disabled={saving || processingPhoto}
          >
            {saving ? 'Saving Avatar...' : 'Save Avatar Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
