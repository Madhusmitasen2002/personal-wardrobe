import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const FEATURES = [
  {
    icon: '📸',
    title: 'Snap & Upload',
    description: 'Photograph your clothes and add them to your digital wardrobe in seconds.',
  },
  {
    icon: '👕',
    title: 'Organize by Category',
    description: 'Sort your wardrobe into tops, bottoms, and shoes for easy browsing.',
  },
  {
    icon: '🎨',
    title: 'Mix & Match',
    description: 'Experiment with outfit combinations using your virtual avatar. Coming soon!',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="hero__bg-glow" />
        <div className="hero__content animate-slide-up">
          <span className="hero__badge">✨ Your style, digitized</span>
          <h1 className="hero__title">
            Your Digital
            <br />
            <span className="hero__title-gradient">Wardrobe</span>
          </h1>
          <p className="hero__subtitle">
            Upload, organize, and visualize your entire wardrobe in one beautiful place.
            Build outfits, track what you own, and never wonder "what should I wear?" again.
          </p>
          <div className="hero__actions">
            {isAuthenticated ? (
              <>
                <Link to="/wardrobe" className="hero__btn hero__btn--primary">
                  My Wardrobe
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/upload" className="hero__btn hero__btn--secondary">
                  Upload Item
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="hero__btn hero__btn--primary">
                  Get Started — Free
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
        </div>

        {/* Decorative floating cards */}
        <div className="hero__floating">
          <div className="hero__float-card hero__float-card--1">👕</div>
          <div className="hero__float-card hero__float-card--2">👖</div>
          <div className="hero__float-card hero__float-card--3">👟</div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="features">
        <div className="features__header animate-fade-in">
          <h2 className="features__title">Everything you need</h2>
          <p className="features__subtitle">
            Simple, powerful tools to manage your wardrobe digitally.
          </p>
        </div>

        <div className="features__grid stagger">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card animate-slide-up">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="cta animate-fade-in">
        <div className="cta__glow" />
        <h2 className="cta__title">Ready to get started?</h2>
        <p className="cta__subtitle">
          Join and start building your digital wardrobe today.
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
