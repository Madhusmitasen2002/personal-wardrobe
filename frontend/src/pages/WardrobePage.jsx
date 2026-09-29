import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import AiStylistModal from '../components/AiStylistModal';
import './WardrobePage.css';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'shoe', label: 'Shoes' },
];

export default function WardrobePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isStylistOpen, setIsStylistOpen] = useState(false);

  // Edit item state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('top');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/wardrobe');
      setItems(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openItemModal = (item) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setIsEditing(false);
  };

  const closeItemModal = () => {
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingEdit(true);
    try {
      const res = await api.patch(`/wardrobe/${selectedItem._id}`, {
        name: editName.trim(),
        category: editCategory,
      });
      const updated = res.data.data;
      setItems((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i))
      );
      setSelectedItem(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm(`Delete "${selectedItem.name}" from your wardrobe?`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/wardrobe/${selectedItem._id}`);
      setItems((prev) => prev.filter((i) => i._id !== selectedItem._id));
      closeItemModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = items.filter((item) => {
    const matchesCategory =
      activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryLabel = (cat) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found ? found.label : cat;
  };

  return (
    <div className="wardrobe">
      {/* Header */}
      <div className="wardrobe__header animate-fade-in">
        <div>
          <h1 className="wardrobe__title">My Wardrobe</h1>
          <p className="wardrobe__subtitle">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your collection
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="wardrobe__upload-btn"
            style={{
              background: 'linear-gradient(135deg, var(--accent-start), var(--accent-end))',
              color: '#fff',
            }}
            onClick={() => setIsStylistOpen(true)}
          >
            ✨ Ask AI Stylist
          </button>
          <Link
            to="/studio"
            className="wardrobe__upload-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          >
            👗 Mix & Match Runway
          </Link>
          <Link to="/upload" className="wardrobe__upload-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Item
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="wardrobe__controls animate-fade-in">
        <div className="wardrobe__filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`wardrobe__filter ${activeFilter === cat.key ? 'wardrobe__filter--active' : ''}`}
              onClick={() => setActiveFilter(cat.key)}
            >
              {cat.label}
              {cat.key !== 'all' && (
                <span className="wardrobe__filter-count">
                  {items.filter((i) => i.category === cat.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="wardrobe__search-wrap">
          <svg className="wardrobe__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clothes..."
            className="wardrobe__search-input"
          />
          {searchQuery && (
            <button className="wardrobe__search-clear" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="wardrobe__loading">
          <div className="wardrobe__grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="wardrobe-skeleton">
                <div className="wardrobe-skeleton__img" />
                <div className="wardrobe-skeleton__text" />
                <div className="wardrobe-skeleton__text wardrobe-skeleton__text--short" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="wardrobe__empty animate-fade-in">
          <div className="wardrobe__empty-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchItems} className="wardrobe__retry-btn">Try Again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="wardrobe__empty animate-fade-in">
          <div className="wardrobe__empty-icon">👗</div>
          <h3>
            {searchQuery
              ? `No items match "${searchQuery}"`
              : activeFilter === 'all'
              ? 'Your wardrobe is empty'
              : `No ${categoryLabel(activeFilter).toLowerCase()} yet`}
          </h3>
          <p>
            {searchQuery
              ? 'Try searching with different keywords.'
              : 'Start by uploading your first clothing item.'}
          </p>
          {!searchQuery && (
            <Link to="/upload" className="wardrobe__upload-btn" style={{ marginTop: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Upload Item
            </Link>
          )}
        </div>
      ) : (
        <div className="wardrobe__grid stagger">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="wardrobe-card animate-slide-up"
              onClick={() => openItemModal(item)}
            >
              <div className="wardrobe-card__img-wrap">
                <img src={item.imageUrl} alt={item.name} className="wardrobe-card__img" loading="lazy" />
                <span className="wardrobe-card__badge">{categoryLabel(item.category)}</span>
              </div>
              <div className="wardrobe-card__info">
                <h3 className="wardrobe-card__name">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Edit Modal */}
      {selectedItem && (
        <div className="wardrobe-modal" onClick={closeItemModal}>
          <div className="wardrobe-modal__content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="wardrobe-modal__close" onClick={closeItemModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="wardrobe-modal__img" />

            <div className="wardrobe-modal__details">
              {!isEditing ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="wardrobe-card__badge">{categoryLabel(selectedItem.category)}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="wardrobe-modal__edit-btn"
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  <h2 className="wardrobe-modal__name">{selectedItem.name}</h2>
                  <p className="wardrobe-modal__date">
                    Added {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>

                  <div className="wardrobe-modal__actions">
                    <button
                      className="wardrobe-modal__action-btn wardrobe-modal__action-btn--studio"
                      onClick={() => {
                        navigate(`/studio?item=${selectedItem._id}`);
                      }}
                    >
                      🎨 Mix & Match this
                    </button>
                    <button
                      className="wardrobe-modal__action-btn wardrobe-modal__action-btn--delete"
                      onClick={handleDeleteItem}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdateItem} className="wardrobe-modal__edit-form">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Edit Item</h3>
                  <div className="form-field" style={{ marginBottom: 12 }}>
                    <label className="form-field__label">Item Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="form-field__input"
                      style={{ padding: '8px 12px' }}
                      required
                    />
                  </div>
                  <div className="form-field" style={{ marginBottom: 16 }}>
                    <label className="form-field__label">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="form-field__input"
                      style={{ padding: '8px 12px' }}
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="shoe">Shoe</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="wardrobe-modal__cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="wardrobe-modal__save-btn"
                    >
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Stylist Modal */}
      <AiStylistModal
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        onApplyOutfit={(look) => {
          navigate(`/studio?item=${look.top?._id || look.bottom?._id || look.shoe?._id}`);
        }}
      />
    </div>
  );
}
