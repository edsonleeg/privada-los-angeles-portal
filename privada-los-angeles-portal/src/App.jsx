import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const SUPABASE_URL = 'https://gyglejfhwviybdmklgpdg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LVHoyail_GKmL96OeUeFfg_Jjh9Rm3N';
const DRIVE_FOLDER_ID = '1gSPScMj1zwX_Q8_06GqHDEBwNhNVa3qQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function App() {
  const [page, setPage] = useState('login'); // login, portal, admin
  const [casa, setCasa] = useState('');
  const [email, setEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Cargar PDFs de Drive
  useEffect(() => {
    if (page === 'portal' || page === 'admin') {
      fetchPDFsFromDrive();
    }
  }, [page]);

  const fetchPDFsFromDrive = async () => {
    try {
      // Cargar lista de PDFs desde el folder público
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      
      const pdfList = months.map((month, index) => {
        const year = index < 5 ? '2025' : '2026'; // Agosto 2025 a Agosto 2026
        const monthNum = index < 5 ? (index + 8) : (index - 4);
        return {
          name: `Reporte_Financiero_${month}_${year}.pdf`,
          month: month,
          year: year,
          driveLink: `https://drive.google.com/uc?export=download&id=[PDF_ID]` // Será reemplazado
        };
      });
      
      setPdfs(pdfList);
    } catch (err) {
      console.error('Error cargando PDFs:', err);
    }
  };

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

  const downloadPDF = async (pdfName) => {
    // Aquí van los links directos a Drive
    // Por ahora abre en Drive
    window.open(`https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`, '_blank');
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
          <div className="pdfs-grid">
            {pdfs.map((pdf, idx) => (
              <div key={idx} className="pdf-card">
                <div className="pdf-icon">📄</div>
                <h3>{pdf.month} {pdf.year}</h3>
                <button onClick={() => downloadPDF(pdf.name)}>
                  Descargar
                </button>
              </div>
            ))}
          </div>
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
