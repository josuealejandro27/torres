const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EmpleadoSchema = new Schema({
  nif:        { type: String, required: true, unique: true },
  nombre:     { type: String, required: true },
  email:      { type: String, required: true },
  telefono:   { type: String, required: true },
  foto:       { type: String }, // opcional
  departamento: { type: String, required: true },
  puesto:     { type: String, required: true },
  horario:    { type: String, enum: ['corrido', 'mixto'], required: true },
  entrada1:   { type: String, required: true },
  salida1:    { type: String, required: true },
  entrada2:   { type: String, required: function() { return this.horario === 'mixto'; } }, // solo para horario mixto
  salida2:    { type: String, required: function() { return this.horario === 'mixto'; } }, // solo para horario mixto
  estatus:    { type: Boolean, default: true },
  rol:        { type: String, enum: ['empleado', 'admin'], default: 'empleado' },
  password:   { type: String, required: true }
});

module.exports = mongoose.model('Empleado', EmpleadoSchema);