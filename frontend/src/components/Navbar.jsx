import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="navbar__logo-icon">
            <path d="M12 4a3 3 0 0 0-3 3c0 .8.4 1.5 1 2l-7.5 9.5A1.5 1.5 0 0 0 3.7 21h16.6a1.5 1.5 0 0 0 1.2-2.5L14 9c.6-.5 1-1.2 1-2a3 3 0 0 0-3-3z"/>
          </svg>
          <span className="navbar__logo-text">Maddie's Closet</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/wardrobe"
                className={`navbar__link ${isActive('/wardrobe') ? 'navbar__link--active' : ''}`}
              >
                Wardrobe
              </Link>
              <Link
                to="/studio"
                className={`navbar__link ${isActive('/studio') || isActive('/outfits') ? 'navbar__link--active' : ''}`}
              >
                Outfit Studio
              </Link>
              <Link
                to="/upload"
                className={`navbar__link ${isActive('/upload') ? 'navbar__link--active' : ''}`}
              >
                Upload
              </Link>
            </>
          )}
        </div>

        {/* Desktop auth area */}
        <div className="navbar__auth">
          {isAuthenticated ? (
            <div className="navbar__user-area">
              <div className="navbar__avatar">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="navbar__username">{user?.displayName}</span>
              <button onClick={logout} className="navbar__btn navbar__btn--ghost">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar__auth-links">
              <Link to="/login" className="navbar__btn navbar__btn--ghost">
                Sign In
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${mobileOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__mobile ${mobileOpen ? 'navbar__mobile--open' : ''}`}>
        <Link to="/" className={`navbar__mobile-link ${isActive('/') ? 'navbar__mobile-link--active' : ''}`}>
          Home
        </Link>
        {isAuthenticated ? (
          <>
            <Link
              to="/wardrobe"
              className={`navbar__mobile-link ${isActive('/wardrobe') ? 'navbar__mobile-link--active' : ''}`}
            >
              Wardrobe
            </Link>
            <Link
              to="/studio"
              className={`navbar__mobile-link ${isActive('/studio') || isActive('/outfits') ? 'navbar__mobile-link--active' : ''}`}
            >
              Outfit Studio
            </Link>
            <Link
              to="/upload"
              className={`navbar__mobile-link ${isActive('/upload') ? 'navbar__mobile-link--active' : ''}`}
            >
              Upload
            </Link>
            <div className="navbar__mobile-divider" />
            <div className="navbar__mobile-user">
              <div className="navbar__avatar navbar__avatar--sm">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span>{user?.displayName}</span>
            </div>
            <button onClick={logout} className="navbar__mobile-link navbar__mobile-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__mobile-link">Sign In</Link>
            <Link to="/register" className="navbar__mobile-link navbar__mobile-link--cta">
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="navbar__overlay" onClick={() => setMobileOpen(false)} />
      )}
    </nav>
  );
}
