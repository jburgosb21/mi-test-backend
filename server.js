// ARCHIVO: backend/server.js
// DESCRIPCIÓN: Servidor principal que conecta el Frontend con la base de datos Neon

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middlewares: CORS para permitir que Netlify se conecte y Express para leer JSON
app.use(cors()); 
app.use(express.json());

// Conexión a Neon usando la variable de entorno configurada en Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pFxM4YDVI9uB@ep-falling-shape-aej1nsmh-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// GET: Obtener datos para la tabla de ListaResultados.vue
app.get('/api/resultados', async (req, res) => {
  try {
    const query = 'SELECT nombre, respuestas, creado_en FROM usuarios ORDER BY creado_en DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al leer Neon:", err);
    res.status(500).json({ error: "Error de base de datos" });
  }
});

// POST: Recibir respuestas de TestAptitudes.vue y guardar
app.post('/api/test', async (req, res) => {
  const { nombre, respuestas } = req.body;
  const perfiles = ["Programador", "Manager", "Ingeniero", "Diseñador"];
  
  const conteo = [0, 0, 0, 0];
  respuestas.forEach(r => { if (conteo[r] !== undefined) conteo[r]++; });
  const maxIdx = conteo.indexOf(Math.max(...conteo));

  try {
    await pool.query(
      'INSERT INTO usuarios (nombre, respuestas) VALUES ($1, $2)', 
      [nombre, respuestas]
    );
    res.json({
      cargo: perfiles[maxIdx],
      info: "¡Análisis guardado exitosamente en Neon!"
    });
  } catch (err) {
    console.error("❌ Error al insertar en Neon:", err);
    res.status(500).json({ error: "No se pudo guardar" });
  }
});

// Puerto dinámico: Render usa el 10000 según tus logs
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend activo en puerto ${PORT}`));