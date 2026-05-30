import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './UploadPage.css';

const CATEGORIES = [
  { key: 'top', label: 'Top', icon: '👕' },
  { key: 'bottom', label: 'Bottom', icon: '👖' },
  { key: 'shoe', label: 'Shoe', icon: '👟' },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
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
      formData.append('image', file);
      formData.append('name', name.trim());
      formData.append('category', category);

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
          <h2 className="upload-success__title">Upload Successful!</h2>
          <p className="upload-success__text">Your item has been added to your wardrobe.</p>
          <div className="upload-success__actions">
            <button
              className="upload-btn upload-btn--primary"
              onClick={() => navigate('/wardrobe')}
            >
              View Wardrobe
            </button>
            <button
              className="upload-btn upload-btn--secondary"
              onClick={() => {
                setSuccess(false);
                setFile(null);
                setPreview(null);
                setName('');
                setCategory('');
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <div className="upload-page__content animate-slide-up">
        <div className="upload-page__header">
          <h1 className="upload-page__title">Upload Item</h1>
          <p className="upload-page__subtitle">Add a new piece to your digital wardrobe</p>
        </div>

        {error && (
          <div className="auth-card__error animate-fade-in" style={{ marginBottom: 24 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Drop zone */}
          <div
            className={`upload-dropzone ${dragActive ? 'upload-dropzone--active' : ''} ${preview ? 'upload-dropzone--has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="upload-dropzone__preview">
                <img src={preview} alt="Preview" className="upload-dropzone__img" />
                <button
                  type="button"
                  className="upload-dropzone__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
            ) : (
              <div className="upload-dropzone__placeholder">
                <div className="upload-dropzone__icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="upload-dropzone__text">
                  Drag & drop your image here
                </p>
                <p className="upload-dropzone__hint">or click to browse · PNG, JPG up to 10MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
              className="upload-dropzone__input"
            />
          </div>

          {/* Name */}
          <div className="form-field">
            <label htmlFor="upload-name" className="form-field__label">Item Name</label>
            <div className="form-field__input-wrapper">
              <svg className="form-field__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 7h.01M21 3H3v18h18V3z" />
              </svg>
              <input
                id="upload-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                placeholder="e.g. Blue Denim Jacket"
                className="form-field__input"
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-field">
            <label className="form-field__label">Category</label>
            <div className="upload-categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`upload-category ${category === cat.key ? 'upload-category--active' : ''}`}
                  onClick={() => { setCategory(cat.key); if (error) setError(''); }}
                >
                  <span className="upload-category__icon">{cat.icon}</span>
                  <span className="upload-category__label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="upload-btn upload-btn--primary upload-btn--full" disabled={uploading}>
            {uploading ? (
              <>
                <LoadingSpinner size={20} />
                Uploading...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload to Wardrobe
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
