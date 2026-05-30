export default function LoadingSpinner({ size = 32, className = '' }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid rgba(124, 58, 237, 0.15)`,
        borderTopColor: '#7c3aed',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
      role="status"
      aria-label="Loading"
    />
  );
}
