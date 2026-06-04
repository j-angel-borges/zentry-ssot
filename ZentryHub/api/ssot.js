import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Allow CORS so external LLMs and tools can fetch it directly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { token } = req.query;

  // Security token to protect context privacy
  if (token !== 'zentry-partner-context') {
    return res.status(401).json({ 
      error: 'Acceso Denegado. Token de seguridad inválido o no proporcionado.' 
    });
  }

  try {
    // In Vercel, process.cwd() points to the root of the project deployment (ZentryHub/)
    const dbPath = path.join(process.cwd(), 'src', 'ssot-db.json');
    
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Base de datos SSOT no encontrada en el servidor.' });
    }

    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbContent);

    // Return the full structured database
    return res.status(200).json(db);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error interno al leer la base de datos SSOT.',
      details: error.message 
    });
  }
}
