import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from './LoadingSpinner';
import './AiStylistModal.css';

const OCCASIONS = [
  { label: 'Job Interview', key: 'Job Interview', prompt: 'I have a job interview and need to look polished and professional' },
  { label: 'Smart Casual', key: 'Smart Casual Dinner', prompt: 'Smart casual look for an evening out or dinner with friends' },
  { label: 'Weekend Brunch', key: 'Weekend Brunch', prompt: 'Relaxed weekend morning outfit, comfortable and chic' },
  { label: 'Date Night', key: 'Date Night', prompt: 'Evening dinner date outfit with sophisticated styling' },
  { label: 'Travel', key: 'Travel', prompt: 'Comfortable, stylish travel outfit for a flight or road trip' },
  { label: 'Evening Event', key: 'Gallery Opening', prompt: 'Refined modern look for an evening gathering or event' },
];

export default function AiStylistModal({ isOpen, onClose, onApplyOutfit, onSaveOutfit }) {
  const [selectedOccasion, setSelectedOccasion] = useState(OCCASIONS[0]);
  const [customPrompt, setCustomPrompt] = useState(OCCASIONS[0].prompt);
  const [city, setCity] = useState('Tinsukia');
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [capsuleData, setCapsuleData] = useState(null);
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);
  const [modelUsed, setModelUsed] = useState('');
  const [error, setError] = useState('');
  const [savedStatus, setSavedStatus] = useState({});
  const [feedbackStatus, setFeedbackStatus] = useState({});

  // Fetch initial live weather on modal open
  useEffect(() => {
    if (isOpen) {
      fetchWeather(city);
    }
  }, [isOpen]);

  const fetchWeather = async (cityName) => {
    setLoadingWeather(true);
    try {
      const res = await api.get(`/weather?city=${encodeURIComponent(cityName)}`);
      setWeather(res.data.data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectOccasion = (occ) => {
    setSelectedOccasion(occ);
    setCustomPrompt(occ.prompt);
  };

  const handleConsultStylist = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendations([]);
    setCapsuleData(null);

    try {
      const res = await api.post('/outfits/ai-stylist', {
        prompt: customPrompt,
        occasion: selectedOccasion.key,
        city: city || 'New York',
      });

      const data = res.data.data;
      if (data.isCapsuleRecommendation) {
        setCapsuleData(data);
      } else {
        setRecommendations(data.outfits || []);
      }
      setWeatherSnapshot(data.weatherSnapshot || weather);
      setModelUsed(data.modelUsed || 'AI Stylist');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'The AI Stylist encountered an error. Ensure you have items in your wardrobe!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLook = async (look, idx) => {
    try {
      await api.post('/outfits', {
        name: look.outfitName,
        occasion: look.occasion,
        top: look.top?._id,
        bottom: look.bottom?._id,
        layer: look.layer?._id,
        shoe: look.shoe?._id,
        accessories: look.accessories?.map((a) => a._id) || [],
        colorPalette: look.colorPalette,
        formalityScore: look.formalityScore,
        stylingAdvice: look.whyItWorks,
        weatherReasoning: look.weatherAdaptation,
        alternatives: look.alternatives,
      });
      setSavedStatus((prev) => ({ ...prev, [idx]: true }));
      if (onSaveOutfit) onSaveOutfit(look);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save look');
    }
  };

  const handleSendFeedback = async (look, idx, feedbackType) => {
    try {
      const items = [
        look.top && { slot: 'top', name: look.top.name },
        look.bottom && { slot: 'bottom', name: look.bottom.name },
        look.layer && { slot: 'layer', name: look.layer.name },
        look.shoe && { slot: 'shoe', name: look.shoe.name },
      ].filter(Boolean);

      await api.post('/auth/feedback', {
        outfitName: look.outfitName,
        feedbackType,
        items,
      });

      setFeedbackStatus((prev) => ({
        ...prev,
        [idx]: feedbackType,
      }));
    } catch (err) {
      console.warn('Feedback submission error:', err);
    }
  };

  return (
    <div className="stylist-modal-overlay" onClick={onClose}>
      <div className="stylist-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="stylist-modal__header">
          <div className="stylist-modal__title-row">
            <div className="stylist-modal__icon-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4a3 3 0 0 0-3 3c0 .8.4 1.5 1 2l-7.5 9.5A1.5 1.5 0 0 0 3.7 21h16.6a1.5 1.5 0 0 0 1.2-2.5L14 9c.6-.5 1-1.2 1-2a3 3 0 0 0-3-3z"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="stylist-modal__title">Personal Stylist</h2>
                {modelUsed && <span className="stylist-model-badge">{modelUsed}</span>}
              </div>
              <p className="stylist-modal__subtitle">
                Outfit recommendations curated from pieces in your wardrobe
              </p>
            </div>
          </div>
          <button className="stylist-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Live Weather Widget Strip */}
        <div className="stylist-weather-strip">
          <div className="stylist-weather-info">
            <span className="stylist-weather-icon">{weather?.icon || '🌤️'}</span>
            <div>
              <span className="stylist-weather-temp">
                {weather?.city ? `${weather.city} · ` : ''}{weather ? `${weather.temp}°C` : '22°C'} · {weather?.conditionLabel || 'Pleasant'}
              </span>
              <span className="stylist-weather-details">
                Feels like {weather ? `${weather.feelsLike}°C` : '22°C'} · Humidity {weather?.humidity || 50}% · UV {weather?.uvIndex || 3}
              </span>
            </div>
          </div>

          <div className="stylist-city-selector">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onBlur={() => fetchWeather(city)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWeather(city)}
              placeholder="City (e.g. Tinsukia)"
              className="stylist-city-input"
            />
            <button
              type="button"
              className="stylist-city-btn"
              onClick={() => fetchWeather(city)}
              disabled={loadingWeather}
            >
              {loadingWeather ? '...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="stylist-modal__body">
          <span className="stylist-modal__section-label">Select Occasion</span>
          <div className="stylist-occasions">
            {OCCASIONS.map((occ) => (
              <button
                key={occ.key}
                type="button"
                className={`stylist-chip ${selectedOccasion.key === occ.key ? 'stylist-chip--active' : ''}`}
                onClick={() => handleSelectOccasion(occ)}
              >
                {occ.label}
              </button>
            ))}
          </div>

          <span className="stylist-modal__section-label">Styling Intent / Specific Constraints</span>
          <form onSubmit={handleConsultStylist} className="stylist-prompt-box">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Creative meeting, comfortable shoes, elegant trench layer..."
              className="stylist-input"
            />
            <button
              type="submit"
              className="stylist-generate-btn"
              disabled={loading || !customPrompt.trim()}
            >
              {loading ? (
                <>
                  <LoadingSpinner size={18} />
                  Analyzing Closet...
                </>
              ) : (
                'Find Outfits'
              )}
            </button>
          </form>

          {error && (
            <div className="auth-card__error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* CAPSULE WARDROBE RECOMMENDATION VIEW (When closet is sparse) */}
          {capsuleData && (
            <div className="capsule-box animate-fade-in">
              <div className="capsule-header">
                <span className="capsule-badge">Capsule Wardrobe Starter</span>
                <h3>{capsuleData.closetDiagnosis}</h3>
                <p className="capsule-weather">{capsuleData.weatherPreparedness}</p>
              </div>

              <div className="capsule-grid">
                {capsuleData.priorityPurchases?.map((item, i) => (
                  <div key={i} className="capsule-card animate-slide-up">
                    <div className="capsule-card__slot">{item.slot.toUpperCase()}</div>
                    <h4 className="capsule-card__title">{item.name}</h4>
                    <p className="capsule-card__reason">{item.versatilityReason}</p>
                    <div className="capsule-card__tags">
                      <span>🧵 {item.recommendedFabric}</span>
                      <span>🎨 {item.recommendedColor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS AREA: 3 Curated Looks */}
          {recommendations.length > 0 && (
            <div>
              <div className="stylist-results-header">
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>3 Curated Looks For You</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                    Calibrated for {weatherSnapshot?.temp || 22}°C & {selectedOccasion.key}
                  </span>
                </div>
              </div>

              <div className="stylist-cards">
                {recommendations.map((look, idx) => (
                  <div key={idx} className="stylist-card animate-slide-up">
                    <div className="stylist-card__top">
                      <div>
                        <span className="stylist-card__name">
                          Look {idx + 1}: {look.outfitName}
                        </span>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <span className="stylist-tag-chip">Formality: {look.formalityScore}/10</span>
                          <span className="stylist-tag-chip stylist-tag-chip--confidence">
                            {look.confidenceScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Color Palette Swatches */}
                      {Array.isArray(look.colorPalette) && (
                        <div className="stylist-palette-group" title={look.colorHarmony}>
                          {look.colorPalette.map((hex, hIdx) => (
                            <div
                              key={hIdx}
                              className="stylist-swatch"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Clothing thumbnails: 4 slots */}
                    <div className="stylist-card__items">
                      {/* Top */}
                      <div className="stylist-item-slot">
                        <span className="stylist-item-slot__cat">Inner Top</span>
                        <div className="stylist-item-slot__img-wrap">
                          {look.top?.imageUrl ? (
                            <img src={look.top.imageUrl} alt={look.top.name} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                          )}
                        </div>
                        <span className="stylist-item-slot__name">{look.top?.name || 'No top'}</span>
                      </div>

                      {/* Outer Layer */}
                      <div className="stylist-item-slot">
                        <span className="stylist-item-slot__cat">Layer / Coat</span>
                        <div className="stylist-item-slot__img-wrap">
                          {look.layer?.imageUrl ? (
                            <img src={look.layer.imageUrl} alt={look.layer.name} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Optional</span>
                          )}
                        </div>
                        <span className="stylist-item-slot__name">{look.layer?.name || 'None'}</span>
                      </div>

                      {/* Bottom */}
                      <div className="stylist-item-slot">
                        <span className="stylist-item-slot__cat">Bottom</span>
                        <div className="stylist-item-slot__img-wrap">
                          {look.bottom?.imageUrl ? (
                            <img src={look.bottom.imageUrl} alt={look.bottom.name} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                          )}
                        </div>
                        <span className="stylist-item-slot__name">{look.bottom?.name || 'No bottom'}</span>
                      </div>

                      {/* Shoe */}
                      <div className="stylist-item-slot">
                        <span className="stylist-item-slot__cat">Footwear</span>
                        <div className="stylist-item-slot__img-wrap">
                          {look.shoe?.imageUrl ? (
                            <img src={look.shoe.imageUrl} alt={look.shoe.name} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                          )}
                        </div>
                        <span className="stylist-item-slot__name">{look.shoe?.name || 'No shoe'}</span>
                      </div>
                    </div>

                    {/* Styling Insights */}
                    <div className="stylist-card__advice">
                      💡 <strong>Why It Works:</strong> {look.whyItWorks || look.stylingAdvice}
                    </div>

                    {/* Weather Adaptation Reasoning */}
                    <div className="stylist-card__weather-reason">
                      🌤️ <strong>Weather Rationale:</strong> {look.weatherAdaptation}
                    </div>

                    {/* Color Harmony Breakdown */}
                    {look.colorHarmony && (
                      <div className="stylist-card__harmony">
                        🎨 <strong>Palette Theory:</strong> {look.colorHarmony}
                      </div>
                    )}

                    {/* Feedback Loop Row */}
                    <div className="stylist-feedback-row">
                      <span className="stylist-feedback-label">Tune Future AI Stylings:</span>
                      <div className="stylist-feedback-buttons">
                        <button
                          type="button"
                          className={`feedback-btn ${feedbackStatus[idx] === 'liked' ? 'feedback-btn--active' : ''}`}
                          onClick={() => handleSendFeedback(look, idx, 'liked')}
                        >
                          👍 Love
                        </button>
                        <button
                          type="button"
                          className={`feedback-btn ${feedbackStatus[idx] === 'disliked' ? 'feedback-btn--active' : ''}`}
                          onClick={() => handleSendFeedback(look, idx, 'disliked')}
                        >
                          👎 Dislike
                        </button>
                        <button
                          type="button"
                          className={`feedback-btn ${feedbackStatus[idx] === 'too_hot' ? 'feedback-btn--active' : ''}`}
                          onClick={() => handleSendFeedback(look, idx, 'too_hot')}
                        >
                          🔥 Too Warm
                        </button>
                        <button
                          type="button"
                          className={`feedback-btn ${feedbackStatus[idx] === 'too_formal' ? 'feedback-btn--active' : ''}`}
                          onClick={() => handleSendFeedback(look, idx, 'too_formal')}
                        >
                          👔 Too Formal
                        </button>
                      </div>
                      {feedbackStatus[idx] && (
                        <span className="feedback-toast animate-fade-in">
                          ✓ Preference saved!
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="stylist-card__actions">
                      <button
                        type="button"
                        className="stylist-card__action-btn stylist-card__action-btn--secondary"
                        onClick={() => handleSaveLook(look, idx)}
                        disabled={savedStatus[idx]}
                      >
                        {savedStatus[idx] ? '✓ Saved to Looks' : '💾 Save Look'}
                      </button>
                      <button
                        type="button"
                        className="stylist-card__action-btn stylist-card__action-btn--primary"
                        onClick={() => {
                          onApplyOutfit(look);
                          onClose();
                        }}
                      >
                        👗 Try in Studio & Mannequin ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
