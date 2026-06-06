import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'admin_brinco',
  password: 'Brinco2024$',
  database: 'brinco_creativo',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Ruta de prueba de conexión
app.get('/api/test-connection', async (req, res) => {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    res.json({ success: true, message: 'Conexión a MySQL exitosa' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Ruta para obtener proveedores
app.get('/api/proveedores', async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [rows] = await connection.query('SELECT * FROM proveedores')
    connection.release()
    res.json({ success: true, data: rows })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Iniciar servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📡 API disponible en http://localhost:${PORT}/api`)
})
