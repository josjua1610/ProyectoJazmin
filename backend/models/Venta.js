const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  productos: [
    {
      id_producto: { type: Number, required: true }, // ID producto en MySQL
      cantidad: { type: Number, required: true }
    }
  ],
  fecha: { type: Date, default: Date.now },
  id_vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Venta', ventaSchema);
