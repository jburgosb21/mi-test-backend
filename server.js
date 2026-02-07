const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middlewares para permitir comunicación con el Frontend y leer JSON
app.use(cors()); 
app.use(express.json());

/**
 * Conexión inteligente a Neon.
 * Prioriza la variable de entorno configurada en Render.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pFxM4YDVI9uB@ep-falling-shape-aej1nsmh-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { 
    rejectUnauthorized: false 
  }
});

// ENDPOINT GET: Obtener el historial para la tabla
app.get('/api/resultados', async (req, res) => {
  try {
    // La columna 'creado_en' ya existe en tu base de datos
    const query = 'SELECT nombre, respuestas, creado_en FROM usuarios ORDER BY creado_en DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener datos:", err);
    res.status(500).json({ error: "Error al leer la base de datos" });
  }
});

// ENDPOINT POST: Recibir el test y guardar en Neon
app.post('/api/test', async (req, res) => {
  const { nombre, respuestas } = req.body;
  const perfiles = ["Programador", "Manager", "Ingeniero", "Diseñador"];
  
  // Lógica de cálculo basada en la mayoría
  const conteo = [0, 0, 0, 0];
  respuestas.forEach(r => { if (conteo[r] !== undefined) conteo[r]++; });
  const maxIdx = conteo.indexOf(Math.max(...conteo));

  try {
    // Guardar en la tabla 'usuarios'
    await pool.query(
      'INSERT INTO usuarios (nombre, respuestas) VALUES ($1, $2)', 
      [nombre, respuestas]
    );
    
    res.json({
      cargo: perfiles[maxIdx],
      info: "¡Análisis guardado exitosamente en Neon!"
    });
  } catch (err) {
    console.error("❌ Error al guardar en Neon:", err);
    res.status(500).json({ error: "No se pudo guardar el resultado" });
  }
});

// Escuchar en el puerto dinámico de Render o 3000 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend listo y escuchando en puerto ${PORT}`);
});