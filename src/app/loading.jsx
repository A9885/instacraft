export default function GlobalLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface, #fff)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      {/* Premium Pulsing Logo or Spinner */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '3px solid rgba(139, 0, 0, 0.05)',
          borderTop: '3px solid var(--primary, #8b0000)',
          animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.2rem',
          fontWeight: 900,
          color: 'var(--primary, #8b0000)',
          opacity: 0.8
        }}>
          I
        </div>
      </div>
      
      <p style={{
        marginTop: '1.5rem',
        fontFamily: 'var(--font-heading)',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text-dark, #1a1a1a)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        opacity: 0.6,
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        Authentic India
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}} />
    </div>
  );
}
