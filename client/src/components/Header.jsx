import { useState, useRef, useEffect } from 'react';

const APPS = [
  { id: 'routemapper',   label: 'RouteMapper',   href: 'https://morrislabs.app/routemapper/' },
  { id: 'weathermapper', label: 'WeatherMapper',  href: 'https://morrislabs.app/weathermapper/' },
];

export function Header({ currentApp }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      backgroundColor: 'var(--ml-surface)',
      borderBottom: '1px solid var(--ml-border)',
    }}>
      <div style={{
        maxWidth: '1080px', marginInline: 'auto',
        paddingInline: '1.5rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        height: '56px',
      }}>
        {/* Wordmark */}
        <a href="https://morrislabs.app/" style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: '1.05rem', letterSpacing: '-0.025em',
          color: 'var(--ml-ink)', textDecoration: 'none',
        }}>
          Morris<span style={{ color: 'var(--ml-accent-fg)' }}>Labs</span>
        </a>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="https://morrislabs.app/" style={{
            fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.875rem',
            fontWeight: 500, color: 'var(--ml-muted)', textDecoration: 'none',
          }}>
            Home
          </a>

          {/* Apps dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.875rem',
                fontWeight: 500, color: 'var(--ml-ink)', background: 'none',
                border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '4px', padding: '4px 0',
              }}
            >
              Apps
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                backgroundColor: 'var(--ml-surface)', border: '1px solid var(--ml-border)',
                borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                minWidth: '160px', overflow: 'hidden',
              }}>
                {APPS.map((app) => (
                  <a
                    key={app.id}
                    href={app.href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'block', padding: '10px 14px',
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: '0.875rem', textDecoration: 'none',
                      color: app.id === currentApp ? 'var(--ml-accent-fg)' : 'var(--ml-ink)',
                      backgroundColor: app.id === currentApp ? 'var(--ml-accent-bg)' : 'transparent',
                      fontWeight: app.id === currentApp ? 500 : 400,
                    }}
                  >
                    {app.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
