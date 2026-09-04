# Privada Los Ángeles - Portal de Estados de Cuenta

Portal web para residentes titulares de Privada Los Ángeles. Autenticación con Casa + Email, acceso a estados de cuenta mensuales desde Google Drive, y dashboard admin para ver registros de acceso.

---

## 🚀 INSTRUCCIONES DE DEPLOYMENT

### PASO 1: Configurar Supabase

1. **Crear las tablas en Supabase:**
   - Ve a tu proyecto Supabase: https://app.supabase.com
   - Click en "SQL Editor" (a la izquierda)
   - Click en "New Query"
   - Copia y pega ESTO:

```sql
-- Tabla de Residentes Titulares
CREATE TABLE residentes (
  id SERIAL PRIMARY KEY,
  casa VARCHAR(10) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Logs de Acceso
CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  casa VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  FOREIGN KEY (casa) REFERENCES residentes(casa)
);

-- Indices
CREATE INDEX idx_residentes_casa ON residentes(casa);
CREATE INDEX idx_residentes_email ON residentes(email);
CREATE INDEX idx_logs_casa ON access_logs(casa);
CREATE INDEX idx_logs_accessed_at ON access_logs(accessed_at);

-- RLS
ALTER TABLE residentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "residentes_select" ON residentes FOR SELECT USING (true);
CREATE POLICY "access_logs_insert" ON access_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "access_logs_select" ON access_logs FOR SELECT USING (true);
```

   - Click en "Run" (espera 5 segundos)
   - ✅ Listo, tablas creadas

2. **Cargar los 97 residentes titulares:**
   - Mantén ese editor abierto
   - Copia este SQL (reemplaza con tus datos reales):

```sql
INSERT INTO residentes (casa, email, nombre) VALUES
('702', 'residente702@email.com', 'Residente 702'),
('703', 'residente703@email.com', 'Residente 703'),
('704', 'residente704@email.com', 'Residente 704'),
-- ... continúa con los 97
;
```

   - O si tienes un CSV, puedo ayudarte a convertirlo

3. **Habilitar acceso público:**
   - Ve a "Authentication" (a la izquierda)
   - En "Policies", asegúrate que estén enabled las policies que pegaste arriba

---

### PASO 2: Preparar GitHub

1. Crea una carpeta nueva en tu computadora: `privada-los-angeles-portal`
2. Abre terminal en esa carpeta
3. Ejecuta:

```bash
git init
git add .
git commit -m "Initial commit"
```

4. Ve a https://github.com/new
5. Crea un repositorio llamado `privada-los-angeles-portal`
6. Copia las instrucciones y ejecuta en terminal:

```bash
git remote add origin https://github.com/[TU_USUARIO]/privada-los-angeles-portal.git
git branch -M main
git push -u origin main
```

---

### PASO 3: Deployar a Vercel

1. Ve a https://vercel.com/new
2. Click en "Import Git Repository"
3. Pega el URL de tu repo GitHub
4. En "Environment Variables", agrega:
   - `VITE_SUPABASE_URL`: https://gyglejfhwviybdmklgpdg.supabase.co
   - `VITE_SUPABASE_KEY`: sb_publishable_LVHoyail_GKmL96OeUeFfg_Jjh9Rm3N
5. Click "Deploy"
6. **Espera 2-3 minutos...**
7. ✅ Tu app estará en: `https://[TU_APP].vercel.app`

---

## 🔐 Credenciales

- **Admin password:** `admin123Los` (cambia en App.jsx línea 75)
- **Supabase URL:** https://gyglejfhwviybdmklgpdg.supabase.co
- **Supabase Key:** sb_publishable_LVHoyail_GKmL96OeUeFfg_Jjh9Rm3N

---

## 📝 Cambios a hacer DESPUÉS de deployar

1. **Cambiar contraseña admin:**
   - Abre `src/App.jsx`
   - Línea 75: `if (adminPass === 'admin123Los')` 
   - Reemplaza con lo que quieras
   - Haz `git push`
   - Vercel redeploya automáticamente

2. **Cambiar contraseña de Supabase:**
   - Ve a https://app.supabase.com
   - Settings > Database > Change Password
   - Guarda la nueva

3. **Agregar PDFs a Drive:**
   - Los PDFs deben estar nombrados así: `Reporte_Financiero_Enero_2025.pdf`, `Reporte_Financiero_Febrero_2025.pdf`, etc.
   - Carpeta pública en Drive (ya lo hiciste)

---

## 📦 Local Development

Si quieres probar en local:

```bash
npm install
npm run dev
```

Abre http://localhost:5173

---

## 📊 Estructura de archivos

```
privada-los-angeles-portal/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── .env.local (no subir a GitHub)
└── README.md
```

---

## 🆘 Troubleshooting

**"Casa o email incorrectos"**
- Verifica que los datos en Supabase sean exactos
- Asegúrate que el usuario ingrese la casa SIN espacios

**"Error de conexión"**
- Verifica las variables de entorno en Vercel
- Comprueba que Supabase esté online: https://status.supabase.com

**"No puedo descargar PDFs"**
- Verifica que la carpeta de Drive sea pública
- Los PDFs deben estar nombrados exactamente como aparece en la app

---

Hecho con ❤️ para Privada Los Ángeles
