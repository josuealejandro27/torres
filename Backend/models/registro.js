const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RegistroSchema = new Schema({
  nif:      { type: String, required: true },       // NIF del empleado que realiza el registro
  fecha:    { type: String, required: true },       // Fecha local (YYYY-MM-DD) en Dolores Hidalgo
  hora:     { type: String, required: true },       // Hora local del registro (HH:mm:ss)
  faltas:   { type: Number, default: 0 },           // Número de faltas (ej. 1 si el empleado no se presentó en el día)
  retardo:  { type: Number, default: 0 },           // Minutos de retardo (si llegó tarde respecto a su hora de entrada)
  comentario: { type: String, default: '' }         // Comentario opcional
});

module.exports = mongoose.model('Registro', RegistroSchema);
