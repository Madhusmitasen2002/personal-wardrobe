import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './HomePage.css';

const PRESET_CITIES = ['Tinsukia', 'Guwahati', 'Delhi', 'Mumbai', 'London', 'Paris'];

const CORE_PILLARS = [
  {
    step: '01',
    badge: 'Catalog',
    title: 'Digital Closet Organization',
    description:
      'Upload photos of your clothes. Backgrounds are removed cleanly so each piece looks neat, crisp, and catalog-ready.',
  },
  {
    step: '02',
    badge: 'Forecast',
    title: 'Weather-Ready Dressing',
    description:
      'Check the local temperature and get smart layering suggestions before you head out, from crisp mornings to warm afternoons.',
  },
  {
    step: '03',
    badge: 'Styling',
    title: 'Effortless Combinations',
    description:
      'Discover fresh pairings from items already hanging in your closet using balanced color palettes and classic silhouettes.',
  },
  {
    step: '04',
    badge: 'Studio',
    title: 'Mix & Match Canvas',
    description:
      'Combine tops, bottoms, shoes, and outerwear on a clean canvas to test and plan your favorite looks before stepping out.',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState('Tinsukia');
  const [cityInput, setCityInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Fetch weather by city name
  const fetchWeatherByCity = async (cityName) => {
    setLoadingWeather(true);
    try {
      const res = await api.get(`/weather?city=${encodeURIComponent(cityName)}`);
      if (res.data?.data) {
        setWeather(res.data.data);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeatherByCity(city);
  }, [city]);

  // Search custom city
  const handleCitySearch = (e) => {
    e.preventDefault();
    const trimmed = cityInput.trim();
    if (trimmed) {
      setCity(trimmed);
      setCityInput('');
    }
  };

  // Auto-detect location via browser GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Location is not supported by your browser');
      return;
    }
    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await api.get(`/weather?lat=${latitude}&lon=${longitude}`);
          if (res.data?.data) {
            setWeather(res.data.data);
            setCity(res.data.data.city || 'Your Location');
          }
        } catch (err) {
          console.warn('Geolocation weather error:', err);
        } finally {
          setLoadingWeather(false);
        }
      },
      (err) => {
        console.warn('Location permission denied or unavailable:', err);
        setLoadingWeather(false);
      },
      { timeout: 8000 }
    );
  };

  // Compute daily weather-ready recommendation
  const getStylingAdvice = () => {
    if (!weather) return 'Checking local weather forecast...';
    const temp = weather.temp;
    const isRaining = weather.precipitation > 0;

    let advice = '';
    if (temp < 10) {
      advice = 'Chilly day: Ideal for warm knitwear, a tailored wool coat, and boots.';
    } else if (temp < 18) {
      advice = 'Crisp & cool: A trench or knit sweater layered over a clean base with tailored pants.';
    } else if (temp < 25) {
      advice = 'Mild & comfortable: A breathable cotton shirt, relaxed chinos, or an effortless dress.';
    } else {
      advice = 'Warm & sunny: Light linen, breezy silhouettes, and open summer footwear.';
    }

    if (isRaining) {
      advice += ' Keep an umbrella or light water-resistant layer handy.';
    }
    return advice;
  };

  return (
    <div className="home">
      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="hero__content animate-slide-up">
          <span className="hero__badge">Intentional Wardrobe & Styling</span>
          <h1 className="hero__title">
            Curate what you own.
            <br />
            <span className="hero__title-serif">Dress with effortless ease.</span>
          </h1>
          <p className="hero__subtitle">
            A clean digital closet to organize your real clothes, discover fresh combinations, and plan outfits suited to today's weather.
          </p>

          <div className="hero__actions">
            {isAuthenticated ? (
              <>
                <Link to="/wardrobe" className="hero__btn hero__btn--primary">
                  Open Wardrobe
                </Link>
                <Link to="/studio" className="hero__btn hero__btn--secondary">
                  Outfit Studio
                </Link>
                <Link to="/upload" className="hero__btn hero__btn--secondary">
                  Add Item
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="hero__btn hero__btn--primary">
                  Start Your Wardrobe
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

          {/* ─── Weather Capsule Card ─── */}
          <div className="hero-weather-card animate-fade-in">
            <div className="hero-weather-card__header">
              <div className="hero-weather-card__city-controls">
                <div className="hero-weather-card__city-pills">
                  {PRESET_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`city-pill ${city.toLowerCase() === c.toLowerCase() ? 'city-pill--active' : ''}`}
                      onClick={() => setCity(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* City Search Box */}
                <form onSubmit={handleCitySearch} className="city-search-form">
                  <input
                    type="text"
                    placeholder="Search any city..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="city-search-input"
                  />
                  <button type="submit" className="city-search-btn" title="Search city weather">
                    Search
                  </button>
                </form>

                {/* Auto-detect GPS button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="city-locate-btn"
                  title="Detect my current location"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  My Location
                </button>
              </div>

              <span className="hero-weather-card__live-tag">
                <span className="live-dot" /> TODAY'S FORECAST
              </span>
            </div>

            <div className="hero-weather-card__body">
              <div className="hero-weather-temp-col">
                <span className="hero-weather-icon">{weather?.icon || '🌤️'}</span>
                <div>
                  <div className="hero-weather-location-label">
                    {weather?.city || city}
                  </div>
                  <div className="hero-weather-temp">
                    {loadingWeather ? '...' : `${weather?.temp ?? 20}°C`}
                  </div>
                  <div className="hero-weather-cond">
                    {weather?.conditionLabel || 'Partly Cloudy'} · Feels like {weather?.feelsLike ?? 20}°C
                  </div>
                </div>
              </div>

              <div className="hero-weather-formula">
                <div className="hero-weather-formula__label">TODAY'S STYLING NOTE</div>
                <div className="hero-weather-formula__text">{getStylingAdvice()}</div>
              </div>

              <div className="hero-weather-action">
                <Link
                  to="/studio?openStylist=true"
                  className="hero-weather-cta"
                  title="Plan an outfit for today's weather"
                >
                  Plan Outfit →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Pillars Section ─── */}
      <section className="features">
        <div className="features__header animate-fade-in">
          <span className="hero__badge" style={{ marginBottom: 12 }}>How It Works</span>
          <h2 className="features__title">Simplicity Meets Everyday Style</h2>
          <p className="features__subtitle">
            Everything you need to get the most out of the clothes you already love.
          </p>
        </div>

        <div className="features__grid stagger">
          {CORE_PILLARS.map((f, i) => (
            <div key={i} className="feature-card animate-slide-up">
              <div className="feature-card__top">
                <div className="feature-card__step">{f.step}</div>
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
        <div className="tryon-banner__content">
          <div className="tryon-banner__tag">Outfit Studio</div>
          <h2 className="tryon-banner__title">Preview Looks Before Stepping Out</h2>
          <p className="tryon-banner__desc">
            Mix and match pieces on an interactive canvas. Compare combinations side-by-side and curate complete outfits with confidence.
          </p>
          <div className="tryon-banner__actions">
            <Link to="/studio" className="hero__btn hero__btn--primary">
              Open Outfit Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="cta animate-fade-in">
        <h2 className="cta__title">Start Building Your Digital Wardrobe</h2>
        <p className="cta__subtitle">
          Organize your closet and discover new ways to wear what you already have.
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
