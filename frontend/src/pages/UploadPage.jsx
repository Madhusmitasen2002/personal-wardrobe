import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { removeBackgroundFromFile } from '../utils/backgroundRemoval';
import './UploadPage.css';

const CATEGORIES = [
  { key: 'top', label: 'Top', icon: '👕' },
  { key: 'bottom', label: 'Bottom', icon: '👖' },
  { key: 'layer', label: 'Layer / Jacket', icon: '🧥' },
  { key: 'shoe', label: 'Footwear', icon: '👟' },
  { key: 'accessory', label: 'Accessory', icon: '👜' },
];

const FABRICS = [
  'cotton',
  'linen',
  'wool',
  'cashmere',
  'silk',
  'denim',
  'leather',
  'knit',
  'polyester',
  'blend',
  'other',
];

const LENGTHS = [
  { key: 'cropped', label: 'Cropped' },
  { key: 'regular', label: 'Regular' },
  { key: 'waist', label: 'Waist' },
  { key: 'hip', label: 'Hip' },
  { key: 'knee', label: 'Knee' },
  { key: 'midi', label: 'Midi' },
  { key: 'maxi', label: 'Maxi' },
  { key: 'unspecified', label: 'Standard' },
];

const SEASONS = ['spring', 'summer', 'fall', 'winter', 'all_season'];

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [rawFile, setRawFile] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cutoutPreview, setCutoutPreview] = useState(null);
  const [useCutout, setUseCutout] = useState(true);

  // Background removal state
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [processingBg, setProcessingBg] = useState(false);
  const [bgStatusText, setBgStatusText] = useState('');

  // AI Vision Auto-Tagging state
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiTagNotice, setAiTagNotice] = useState('');

  // Garment Metadata Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [length, setLength] = useState('regular');
  const [layerType, setLayerType] = useState('base');
  const [fabric, setFabric] = useState('cotton');
  const [formality, setFormality] = useState(5);
  const [colorName, setColorName] = useState('Neutral');
  const [colorHex, setColorHex] = useState('#64748b');
  const [colorTemp, setColorTemp] = useState('neutral');
  const [selectedSeasons, setSelectedSeasons] = useState(['all_season']);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);

  const processFile = async (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setError('Image must be under 15MB');
      return;
    }

    setRawFile(f);
    const originalUrl = URL.createObjectURL(f);
    setPreview(originalUrl);
    setCutoutPreview(null);
    setFileToUpload(f);
    setError('');

    // Pre-fill name from filename as initial hint
    const cleanFileName = f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!name) setName(cleanFileName);

    // 1. Kick off Gemini Vision Auto-Tagging
    triggerAiAnalysis(f, cleanFileName);

    // 2. Client-side AI Cutout if enabled
    if (autoRemoveBg) {
      setProcessingBg(true);
      setBgStatusText('AI isolating garment...');

      try {
        const result = await removeBackgroundFromFile(f, (status) => {
          setBgStatusText(status);
        });

        if (result && result.success) {
          setCutoutPreview(result.previewUrl);
          setFileToUpload(result.file);
          setUseCutout(true);
        }
      } catch (err) {
        console.warn('Background removal error:', err);
      } finally {
        setProcessingBg(false);
        setBgStatusText('');
      }
    }
  };

  const triggerAiAnalysis = async (file, hintName) => {
    setAnalyzingAi(true);
    setAiTagNotice('✨ Gemini Vision is analyzing garment attributes...');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('hintName', hintName || '');

      const res = await api.post('/wardrobe/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data.data;
      if (data) {
        if (data.name) setName(data.name);
        if (data.category) setCategory(data.category);
        if (data.subcategory) setSubcategory(data.subcategory);
        if (data.length) setLength(data.length);
        if (data.layerType) setLayerType(data.layerType);
        if (data.fabric) setFabric(data.fabric);
        if (data.formality) setFormality(data.formality);
        if (data.color?.name) setColorName(data.color.name);
        if (data.color?.hex) setColorHex(data.color.hex);
        if (data.color?.temperature) setColorTemp(data.color.temperature);
        if (Array.isArray(data.season) && data.season.length > 0) setSelectedSeasons(data.season);
        if (Array.isArray(data.tags)) setTags(data.tags);

        setAiTagNotice('✨ Auto-tagged with AI! You can refine any field below.');
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err.message);
      setAiTagNotice('Applied smart cataloging defaults. Edit fields below.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    processFile(f);
  };

  const removeFile = () => {
    setRawFile(null);
    setFileToUpload(null);
    setPreview(null);
    setCutoutPreview(null);
    setAiTagNotice('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleCutoutMode = (cutoutActive) => {
    setUseCutout(cutoutActive);
    if (!cutoutActive) {
      setFileToUpload(rawFile);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleSeason = (seasonKey) => {
    if (seasonKey === 'all_season') {
      setSelectedSeasons(['all_season']);
      return;
    }
    const filtered = selectedSeasons.filter((s) => s !== 'all_season');
    if (filtered.includes(seasonKey)) {
      const next = filtered.filter((s) => s !== seasonKey);
      setSelectedSeasons(next.length > 0 ? next : ['all_season']);
    } else {
      setSelectedSeasons([...filtered, seasonKey]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalFile = useCutout && cutoutPreview ? fileToUpload : rawFile;

    if (!finalFile) {
      setError('Please select an image');
      return;
    }
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', finalFile);
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('subcategory', subcategory || 'general');
      formData.append('length', length);
      formData.append('layerType', layerType);
      formData.append('fabric', fabric);
      formData.append('formality', formality);
      formData.append('season', JSON.stringify(selectedSeasons));
      formData.append('tags', JSON.stringify(tags));
      formData.append(
        'color',
        JSON.stringify({
          name: colorName,
          hex: colorHex,
          temperature: colorTemp,
        })
      );

      await api.post('/wardrobe/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="upload-page">
        <div className="upload-success animate-slide-up">
          <h2 className="upload-success__title">✨ Added to Wardrobe!</h2>
          <p className="upload-success__text">
            Your item is cataloged with smart layering, fabric, and formality tags.
          </p>
          <div className="upload-success__actions">
            <button
              className="upload-btn upload-btn--primary"
              onClick={() => navigate('/studio')}
            >
              Style in Studio ✨
            </button>
            <button
              className="upload-btn upload-btn--secondary"
              onClick={() => navigate('/wardrobe')}
            >
              View Wardrobe
            </button>
            <button
              className="upload-btn upload-btn--secondary"
              onClick={() => {
                setSuccess(false);
                removeFile();
                setName('');
                setCategory('');
                setSubcategory('');
                setTags([]);
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeDisplayUrl = useCutout && cutoutPreview ? cutoutPreview : preview;

  return (
    <div className="upload-page">
      <div className="upload-page__content animate-slide-up">
        <div className="upload-page__header">
          <span className="upload-page__badge">AI Digital Wardrobe Builder</span>
          <h1 className="upload-page__title">Upload Garment</h1>
          <p className="upload-page__subtitle">
            Catalog your wardrobe with automatic Gemini Vision tagging & clean background isolation
          </p>
        </div>

        {error && (
          <div className="auth-card__error animate-fade-in" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          {/* AI Cutout Feature Option Toggle */}
          <div className="upload-ai-badge-row">
            <label className="upload-ai-toggle">
              <input
                type="checkbox"
                checked={autoRemoveBg}
                onChange={(e) => setAutoRemoveBg(e.target.checked)}
              />
              <span className="upload-ai-toggle__slider" />
              <span className="upload-ai-toggle__label">
                ✨ <strong>AI Background Cutout</strong>
              </span>
            </label>
            <span className="upload-ai-hint">Isolates garment for Runway Mannequin</span>
          </div>

          {/* Drop zone */}
          <div
            className={`upload-dropzone ${dragActive ? 'upload-dropzone--active' : ''} ${
              preview ? 'upload-dropzone--has-file' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="upload-dropzone__preview">
                <div
                  className={`upload-preview-container ${
                    useCutout && cutoutPreview ? 'upload-preview-container--transparent' : ''
                  }`}
                >
                  <img src={activeDisplayUrl} alt="Preview" className="upload-dropzone__img" />

                  {(processingBg || analyzingAi) && (
                    <div className="upload-dropzone__processing-overlay">
                      <LoadingSpinner size={26} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {analyzingAi ? 'Gemini Vision tagging...' : bgStatusText || 'Isolating garment...'}
                      </span>
                    </div>
                  )}
                </div>

                {cutoutPreview && (
                  <div className="upload-cutout-switcher">
                    <button
                      type="button"
                      className={`upload-switcher-btn ${useCutout ? 'upload-switcher-btn--active' : ''}`}
                      onClick={() => toggleCutoutMode(true)}
                    >
                      ✨ Cutout
                    </button>
                    <button
                      type="button"
                      className={`upload-switcher-btn ${!useCutout ? 'upload-switcher-btn--active' : ''}`}
                      onClick={() => toggleCutoutMode(false)}
                    >
                      Original
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="upload-dropzone__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className="upload-dropzone__placeholder">
                <div className="upload-dropzone__icon">📸</div>
                <p className="upload-dropzone__text">Drag & drop or click to upload clothing photo</p>
                <p className="upload-dropzone__hint">PNG, JPG up to 15MB · AI auto-tags details instantly</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => processFile(e.target.files[0])}
              className="upload-dropzone__input"
            />
          </div>

          {/* AI Banner */}
          {aiTagNotice && (
            <div className="upload-ai-notice animate-fade-in">
              <span>{aiTagNotice}</span>
            </div>
          )}

          {/* Garment Name */}
          <div className="form-field">
            <label htmlFor="upload-name" className="form-field__label">
              Garment Title
            </label>
            <input
              id="upload-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Camel Double-Breasted Wool Trench"
              className="form-field__input"
            />
          </div>

          {/* Category Select */}
          <div className="form-field">
            <label className="form-field__label">Category Slot</label>
            <div className="upload-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`upload-category ${category === cat.key ? 'upload-category--active' : ''}`}
                  onClick={() => {
                    setCategory(cat.key);
                    if (cat.key === 'layer') setLayerType('outer');
                    if (error) setError('');
                  }}
                >
                  <span className="upload-category__icon">{cat.icon}</span>
                  <span className="upload-category__label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory & Length Grid */}
          <div className="upload-grid-2col">
            <div className="form-field">
              <label className="form-field__label">Subtype / Silhouette</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. trench_coat, blazer, loafers"
                className="form-field__input"
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Garment Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="form-field__input form-field__select"
              >
                {LENGTHS.map((len) => (
                  <option key={len.key} value={len.key}>
                    {len.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Layer Type & Fabric Grid */}
          <div className="upload-grid-2col">
            <div className="form-field">
              <label className="form-field__label">Layering Tier</label>
              <select
                value={layerType}
                onChange={(e) => setLayerType(e.target.value)}
                className="form-field__input form-field__select"
              >
                <option value="base">Base Layer (Shirts, Tees, Tanks)</option>
                <option value="mid">Mid Layer (Cardigans, Knitwear, Sweaters)</option>
                <option value="outer">Outer Layer (Blazers, Coats, Parkas)</option>
                <option value="unspecified">Unspecified</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-field__label">Primary Fabric</label>
              <select
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="form-field__input form-field__select"
              >
                {FABRICS.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Formality Slider */}
          <div className="upload-grid-2col">
            <div className="form-field">
              <label className="form-field__label">Color Swatch & Tone</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    cursor: 'pointer',
                    background: 'none',
                  }}
                />
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Color name"
                  className="form-field__input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">
                Formality Level: <strong style={{ color: 'var(--accent-end)' }}>{formality}/10</strong>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formality}
                onChange={(e) => setFormality(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-start)', marginTop: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Casual (1)</span>
                <span>Smart Casual (5)</span>
                <span>Formal (10)</span>
              </div>
            </div>
          </div>

          {/* Season Compatibility */}
          <div className="form-field">
            <label className="form-field__label">Season Suitability</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`upload-season-chip ${selectedSeasons.includes(s) ? 'upload-season-chip--active' : ''}`}
                  onClick={() => toggleSeason(s)}
                >
                  {s === 'all_season' ? '✨ All Seasons' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Tags */}
          <div className="form-field">
            <label className="form-field__label">Style Tags (Type & Press Enter)</label>
            <div className="upload-tags-box">
              {tags.map((t) => (
                <span key={t} className="upload-tag-pill">
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'e.g. minimalist, oversized, executive...' : '+ tag'}
                className="upload-tag-input"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="upload-btn upload-btn--primary upload-btn--full"
            disabled={uploading || processingBg || analyzingAi}
          >
            {uploading ? (
              <>
                <LoadingSpinner size={20} />
                Cataloging Garment...
              </>
            ) : analyzingAi ? (
              <>
                <LoadingSpinner size={20} />
                Gemini Vision Tagging...
              </>
            ) : (
              '✨ Save Garment to Wardrobe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
