const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors()); 
app.use(express.json());

// Conexión a Neon
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_pFxM4YDVI9uB@ep-falling-shape-aej1nsmh-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// NUEVO: Ruta para obtener todos los registros (para la tabla)
app.get('/api/resultados', async (req, res) => {
  try {
    const query = 'SELECT nombre, respuestas, creado_en FROM usuarios ORDER BY creado_en DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener datos:", err);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// Ruta para guardar el test
app.post('/api/test', async (req, res) => {
  const { nombre, respuestas } = req.body;
  const perfiles = ["Programador", "Manager", "Ingeniero", "Diseñador"];
  const conteo = [0,0,0,0];
  respuestas.forEach(r => conteo[r]++);
  const maxIdx = conteo.indexOf(Math.max(...conteo));

  try {
    await pool.query('INSERT INTO usuarios (nombre, respuestas) VALUES ($1, $2)', [nombre, respuestas]);
    console.log(`✅ Resultado guardado para: ${nombre}`);
    res.json({
      cargo: perfiles[maxIdx],
      info: "¡Análisis completado con éxito!"
    });
  } catch (err) {
    console.error("❌ Error en Neon:", err);
    res.status(500).send("Error de servidor");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`));