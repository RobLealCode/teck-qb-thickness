import { supabase } from '../lib/supabase'

export default function Header({ session, onAddMeasurement }) {
  const username = session?.user?.email?.split('@')[0] || 'Usuario'

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3h16.5" />
        </svg>
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>TECK QB</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Espesores MWS</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-primary" onClick={onAddMeasurement}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Medición
        </button>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          {username}
        </span>
        <button
          className="btn"
          onClick={() => supabase.auth.signOut()}
          title="Cerrar sesión"
          style={{ padding: '7px 10px' }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>
  )
}
