import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const SUPABASE_URL = 'https://gyqjefhwviybdmklgpdg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LVHoyail_GKmL96OeUeFfg_Jjh9Rm3N';

// Carpetas de Drive por año (folder público, "cualquiera con el enlace")
const DRIVE_FOLDERS = {
  '2025': '1gSPScMj1zwX_Q8_06GqHDEBwNhNVa3qQ',
  '2026': '1WHdzU2HtRMMqZ5i9QXC1e7u6fDir3v2k',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const [page, setPage] = useState('login'); // login, portal, admin
  const [casa, setCasa] = useState('');
  const [email, setEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeYear, setActiveYear] = useState('2026');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!casa || !email) {
        setError('Casa y email son requeridos');
        return;
      }

      // Validar contra Supabase
      const { data, error: err } = await supabase
        .from('residentes')
        .select('*')
        .eq('casa', casa.trim())
        .eq('email', email.trim())
        .single();

      if (err || !data) {
        setError('Casa o email incorrectos');
        return;
      }

      // Registrar acceso
      await supabase.from('access_logs').insert([
        {
          casa: casa.trim(),
          email: email.trim(),
          ip_address: 'user-ip',
          user_agent: navigator.userAgent
        }
      ]);

      setCurrentUser(data);
      setPage('portal');
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Contraseña admin simple (cambia esto)
    if (adminPass === 'admin123Los') {
      setPage('admin');
      fetchLogs();
    } else {
      setError('Contraseña admin incorrecta');
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(100);

      if (!error) {
        setLogs(data || []);
      }
    } catch (err) {
      console.error('Error cargando logs:', err);
    }
  };

  return (
    <div className="app">
      {page === 'login' && (
        <div className="login-container">
          <div className="login-box">
            <h1>Privada Los Ángeles</h1>
            <h2>Estados de Cuenta</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Casa #"
                value={casa}
                onChange={(e) => setCasa(e.target.value)}
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email registrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Acceder'}
              </button>
            </form>
            <hr />
            <div className="admin-section">
              <details>
                <summary>Admin</summary>
                <form onSubmit={handleAdminLogin}>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                  />
                  {error && <p className="error">{error}</p>}
                  <button type="submit">Entrar</button>
                </form>
              </details>
            </div>
          </div>
        </div>
      )}

      {page === 'portal' && (
        <div className="portal-container">
          <div className="portal-header">
            <h1>Estados de Cuenta</h1>
            <p>Casa {currentUser?.casa} - {currentUser?.nombre}</p>
            <button onClick={() => { setPage('login'); setCurrentUser(null); }} className="logout-btn">
              Cerrar sesión
            </button>
          </div>

          <div className="year-tabs">
            {Object.keys(DRIVE_FOLDERS).map((year) => (
              <button
                key={year}
                className={`year-tab ${activeYear === year ? 'active' : ''}`}
                onClick={() => setActiveYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="drive-preview-card">
            <iframe
              key={activeYear}
              src={`https://drive.google.com/embeddedfolderview?id=${DRIVE_FOLDERS[activeYear]}#list`}
              title={`Estados de cuenta ${activeYear}`}
              className="drive-iframe"
              frameBorder="0"
            />
          </div>
          <p className="drive-hint">
            Da click en cualquier reporte para verlo en vista previa o descargarlo.
          </p>
        </div>
      )}

      {page === 'admin' && (
        <div className="admin-container">
          <div className="admin-header">
            <h1>Dashboard Admin</h1>
            <button onClick={() => { setPage('login'); }} className="logout-btn">
              Salir
            </button>
          </div>
          <div className="admin-content">
            <h2>Accesos Recientes</h2>
            <table>
              <thead>
                <tr>
                  <th>Casa</th>
                  <th>Email</th>
                  <th>Acceso</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{log.casa}</td>
                    <td>{log.email}</td>
                    <td>{new Date(log.accessed_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="info">Total accesos: {logs.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
