import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './HomePage.css';

const CITIES = ['New York', 'Paris', 'Tokyo', 'London', 'Milan'];

const CORE_PILLARS = [
  {
    icon: '🧠',
    badge: 'Gemini 2.5 Engine',
    title: 'AI Stylist & Color Theory',
    description:
      'Harmonizes 60-30-10 dominant, secondary, and accent color proportions. Strictly validates garment IDs with closed-loop feedback learning.',
  },
  {
    icon: '🧍',
    badge: 'Hybrid Try-On Studio',
    title: 'Parametric Mannequin & AI Photo Model',
    description:
      'Instant 2D SVG mannequin with anatomical scaling (shoulders, waist, hips), multi-layer Z-stacking, plus on-demand photorealistic AI rendering.',
  },
  {
    icon: '👁️',
    badge: 'Gemini Vision',
    title: 'Instant Multi-Attribute Auto-Tagging',
    description:
      'Upload a garment photo to instantly detect subcategories, lengths, layer types, fabric textures, formality scores (1-10), and editable tags.',
  },
  {
    icon: '🌦️',
    badge: 'Live Climate Intelligence',
    title: 'Weather-Aware Layering',
    description:
      'Real-time temperature and precipitation awareness prevents cold underdressing, manages rain defense, and suggests temperature-specific layering.',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const res = await api.get(`/weather?city=${encodeURIComponent(city)}`);
        if (isMounted) setWeather(res.data.data);
      } catch (err) {
        console.warn('Weather fetch error:', err);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    };
    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [city]);

  // Compute daily weather-ready recommendation
  const getStylingAdvice = () => {
    if (!weather) return 'Analyzing local climate data...';
    const temp = weather.temp;
    const isRaining = weather.precipitation > 0;

    let advice = '';
    if (temp < 10) {
      advice = 'Cold climate: Heavy knitwear + tailored wool overcoat + insulated boots recommended.';
    } else if (temp < 18) {
      advice = 'Mild & crisp: Layer a merino crewneck or blazer over cotton shirt with structured trousers.';
    } else if (temp < 25) {
      advice = 'Pleasant weather: Breathable cotton top paired with tailored chinos and clean sneakers.';
    } else {
      advice = 'Warm climate: Ultra-light linen, relaxed silhouettes, and breathable open footwear.';
    }

    if (isRaining) {
      advice += ' 🌧️ Rain defense active: Water-resistant outerwear and weather-sealed footwear prioritized.';
    }
    return advice;
  };

  return (
    <div className="home">
      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="hero__bg-glow" />
        <div className="hero__content animate-slide-up">
          <span className="hero__badge">✨ Haute Tech Fashion Platform</span>
          <h1 className="hero__title">
            The Intelligent
            <br />
            <span className="hero__title-gradient">Digital Wardrobe</span>
          </h1>
          <p className="hero__subtitle">
            Next-generation wardrobe intelligence powered by Gemini 2.5.
            Parametric mannequin try-on, automated vision cataloging, and live weather-calibrated styling.
          </p>

          <div className="hero__actions">
            {isAuthenticated ? (
              <>
                <Link to="/studio?openStylist=true" className="hero__btn hero__btn--primary">
                  ✨ Ask AI Stylist
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/studio" className="hero__btn hero__btn--secondary">
                  🧍 Runway Studio
                </Link>
                <Link to="/upload" className="hero__btn hero__btn--secondary">
                  + Snap & Upload
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="hero__btn hero__btn--primary">
                  Get Started Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/login" className="hero__btn hero__btn--secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* ─── Live Weather Intelligence Hero Card ─── */}
          <div className="hero-weather-card animate-fade-in">
            <div className="hero-weather-card__header">
              <div className="hero-weather-card__city-pills">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`city-pill ${city === c ? 'city-pill--active' : ''}`}
                    onClick={() => setCity(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <span className="hero-weather-card__live-tag">
                <span className="live-dot" /> LIVE CLIMATE
              </span>
            </div>

            <div className="hero-weather-card__body">
              <div className="hero-weather-temp-col">
                <span className="hero-weather-icon">{weather?.icon || '🌤️'}</span>
                <div>
                  <div className="hero-weather-temp">
                    {loadingWeather ? '...' : `${weather?.temp ?? 20}°C`}
                  </div>
                  <div className="hero-weather-cond">
                    {weather?.conditionLabel || 'Partly Cloudy'} · Feels like {weather?.feelsLike ?? 20}°C
                  </div>
                </div>
              </div>

              <div className="hero-weather-formula">
                <div className="hero-weather-formula__label">TODAY'S CLIMATE FORMULA</div>
                <div className="hero-weather-formula__text">{getStylingAdvice()}</div>
              </div>

              <div className="hero-weather-action">
                <Link
                  to="/studio?openStylist=true"
                  className="hero-weather-cta"
                  title="Generate outfits calibrated for current weather"
                >
                  Generate Look ↗
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Floating Fashion Chips */}
        <div className="hero__floating" aria-hidden="true">
          <div className="hero__float-card hero__float-card--1">🧥</div>
          <div className="hero__float-card hero__float-card--2">👔</div>
          <div className="hero__float-card hero__float-card--3">👠</div>
        </div>
      </section>

      {/* ─── Core Pillars Section ─── */}
      <section className="features">
        <div className="features__header animate-fade-in">
          <span className="hero__badge" style={{ marginBottom: 12 }}>Architecture</span>
          <h2 className="features__title">Engineered for Sartorial Precision</h2>
          <p className="features__subtitle">
            Not another basic clothing list. A high-fashion digital operating system.
          </p>
        </div>

        <div className="features__grid stagger">
          {CORE_PILLARS.map((f, i) => (
            <div key={i} className="feature-card animate-slide-up">
              <div className="feature-card__top">
                <div className="feature-card__icon">{f.icon}</div>
                <span className="feature-card__badge">{f.badge}</span>
              </div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Interactive Try-On Banner ─── */}
      <section className="tryon-banner animate-fade-in">
        <div className="tryon-banner__glow" />
        <div className="tryon-banner__content">
          <div className="tryon-banner__tag">✨ Next-Generation Try-On</div>
          <h2 className="tryon-banner__title">Experience the Hybrid Try-On Studio</h2>
          <p className="tryon-banner__desc">
            Toggle seamlessly between instant responsive 2D SVG mannequin rendering and on-demand
            photorealistic AI photo generation. Compare before & after with an interactive split slider.
          </p>
          <div className="tryon-banner__actions">
            <Link to="/studio?openProto=true" className="hero__btn hero__btn--primary">
              Launch Try-On Studio ↗
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="cta animate-fade-in">
        <div className="cta__glow" />
        <h2 className="cta__title">Elevate Your Daily Style</h2>
        <p className="cta__subtitle">
          Digitize your collection and unlock live AI styling powered by Gemini 2.5.
        </p>
        <Link
          to={isAuthenticated ? '/wardrobe' : '/register'}
          className="hero__btn hero__btn--primary"
        >
          {isAuthenticated ? 'Open Wardrobe' : 'Create Free Account'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
