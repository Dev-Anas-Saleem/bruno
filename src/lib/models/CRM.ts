
import mongoose from 'mongoose';

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  direccion: String,
  necesidades: String,
  fechaCreacion: { type: Date, default: Date.now },
  ultimaModificacion: { type: Date, default: Date.now }
});

const EmpleadoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  equipo: String,
  equipoTemporal: String,
  comision: Number,
  ultimaComision: Date,
  fechaCreacion: { type: Date, default: Date.now },
  ultimaModificacion: { type: Date, default: Date.now }
});

const EquipoSchema = new mongoose.Schema({
  /* name color members creationdate  lastmodification */
  nombre: { type: String, required: true },
  color: String,
  members: [String],
  fechaCreacion: { type: Date, default: Date.now },
  ultimaModificacion: { type: Date, default: Date.now }
});

const TareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  estado: { type: String, enum: ['pendiente', 'completada', 'vencida'], default: 'pendiente' },
  equipoId: String,
  comision: Number,
  fecha: Date,
  observaciones: String,
  montoCobrado: Number,
  metodoPago: { type: String, enum: ['efectivo', 'tarjeta'] },
  fechaCreacion: { type: Date, default: Date.now },
  ultimaModificacion: { type: Date, default: Date.now }
});

export const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', ClienteSchema);
export const Empleado = mongoose.models.Empleado || mongoose.model('Empleado', EmpleadoSchema);
export const Equipo = mongoose.models.Equipo || mongoose.model('Equipo', EquipoSchema);
export const Tarea = mongoose.models.Tarea || mongoose.model('Tarea', TareaSchema);
