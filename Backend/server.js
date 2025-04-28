require('dotenv').config(); // ¡Esta línea debe ir siempre antes que todo!

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Importar rutas
const empleadosRoutes = require('./routes/empleadosRoutes');
const registrosRoutes = require('./routes/registrosRoutes');

// Crear instancia de Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Añadido para manejar datos de formularios
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Para servir las fotos

// Asegurarse de que la carpeta uploads existe
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
  console.log('✅ Carpeta uploads creada');
}

// Rutas de la API
app.use('/api/empleados', empleadosRoutes);
app.use('/api/registros', registrosRoutes);

// Conexión a MongoDB y levantar servidor
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Conectado a MongoDB');

    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Servidor escuchando en puerto ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1); // Salir del proceso si no conecta
  });