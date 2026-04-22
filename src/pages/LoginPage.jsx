import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const email = `${username.toLowerCase()}@teck-qb.app`
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) setError('Usuario o contraseña incorrectos.')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(47,129,247,0.15)',
            marginBottom: 16,
          }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2f81f7" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3h16.5M3.75 3l2.25 3M20.25 3l-2.25 3M6 3v3M18 3v3M9 21l3-3m0 0l3 3m-3-3V12" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>TECK Quebrada Blanca</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: 4 }}>
            Medición de Espesores — MWS
          </p>
        </div>

        <form onSubmit={handleLogin} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Usuario</label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Moncon"
              required
              autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p style={{ color: 'var(--red)', fontSize: '0.8rem' }}>{error}</p>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
