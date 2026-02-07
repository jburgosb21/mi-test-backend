const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Configuración de Middlewares
app.use(cors()); 
app.use(express.json());

/**
 * Conexión a la base de datos Neon.
 * process.env.DATABASE_URL es la variable que configuraste en Render.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pFxM4YDVI9uB@ep-falling-shape-aej1nsmh-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { 
    rejectUnauthorized: false 
  }
});

// RUTA GET: Obtener todos los registros para la tabla de resultados
app.get('/api/resultados', async (req, res) => {
  try {
    // IMPORTANTE: Asegúrate de que la columna 'creado_en' exista en tu tabla de Neon
    const query = 'SELECT nombre, respuestas, creado_en FROM usuarios ORDER BY creado_en DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener datos:", err);
    res.status(500).json({ error: "Error de servidor al leer la base de datos" });
  }
});

// RUTA POST: Guardar respuestas del test y calcular resultado
app.post('/api/test', async (req, res) => {
  const { nombre, respuestas } = req.body;
  
  // Lógica de perfiles
  const perfiles = ["Programador", "Manager", "Ingeniero", "Diseñador"];
  const conteo = [0,0,0,0];
  
  // Validamos que existan respuestas para evitar errores
  if (!respuestas || !Array.isArray(respuestas)) {
    return res.status(400).json({ error: "Datos de respuestas inválidos" });
  }

  respuestas.forEach(r => {
    if (conteo[r] !== undefined) conteo[r]++;
  });
  
  const maxIdx = conteo.indexOf(Math.max(...conteo));

  try {
    // Inserción en Neon
    await pool.query(
      'INSERT INTO usuarios (nombre, respuestas) VALUES ($1, $2)', 
      [nombre, respuestas]
    );
    
    console.log(`✅ Resultado guardado en Neon para: ${nombre}`);
    
    res.json({
      cargo: perfiles[maxIdx],
      info: "¡Análisis completado con éxito! Tus aptitudes han sido registradas."
    });
  } catch (err) {
    console.error("❌ Error al guardar en Neon:", err);
    res.status(500).json({ error: "Error de servidor al guardar los datos" });
  }
});

// Puerto dinámico para Render o local (3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend activo en el puerto ${PORT}`);
});