import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './WardrobePage.css';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'shoe', label: 'Shoes' },
];

export default function WardrobePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

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

  const filtered =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.category === activeFilter);

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
        <Link to="/upload" className="wardrobe__upload-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Item
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="wardrobe__filters animate-fade-in">
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

      {/* Content */}
      {loading ? (
        <div className="wardrobe__loading">
          {/* Skeleton cards */}
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
          <h3>{activeFilter === 'all' ? 'Your wardrobe is empty' : `No ${categoryLabel(activeFilter).toLowerCase()} yet`}</h3>
          <p>Start by uploading your first clothing item.</p>
          <Link to="/upload" className="wardrobe__upload-btn" style={{ marginTop: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Upload Item
          </Link>
        </div>
      ) : (
        <div className="wardrobe__grid stagger">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="wardrobe-card animate-slide-up"
              onClick={() => setSelectedItem(item)}
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

      {/* Detail Modal */}
      {selectedItem && (
        <div className="wardrobe-modal" onClick={() => setSelectedItem(null)}>
          <div className="wardrobe-modal__content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button className="wardrobe-modal__close" onClick={() => setSelectedItem(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <img src={selectedItem.imageUrl} alt={selectedItem.name} className="wardrobe-modal__img" />
            <div className="wardrobe-modal__details">
              <span className="wardrobe-card__badge">{categoryLabel(selectedItem.category)}</span>
              <h2 className="wardrobe-modal__name">{selectedItem.name}</h2>
              <p className="wardrobe-modal__date">
                Added {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
