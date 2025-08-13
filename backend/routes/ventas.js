const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const Product = require('../models/Product'); // Sequelize
const { verifyToken, allowRoles } = require('../middlewares/auth');

// POST crear venta
router.post('/', verifyToken, allowRoles('admin', 'vendedor'), async (req, res) => {
  try {
    const { productos, id_cliente } = req.body;
    const id_vendedor = req.user.id;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Debe enviar productos para la venta' });
    }
    if (!id_cliente) {
      return res.status(400).json({ error: 'Debe enviar id_cliente' });
    }

    const nuevaVenta = new Venta({
      id_vendedor,
      id_cliente,
      productos,
      fecha: new Date()
    });

    await nuevaVenta.save();

    res.status(201).json({ message: 'Venta creada con éxito', venta: nuevaVenta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando la venta' });
  }
});

// GET listar ventas con detalle y populate (admin y vendedor)
router.get('/', verifyToken, allowRoles('admin', 'vendedor'), async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('id_vendedor', 'name email role')
      .populate('id_cliente', 'name email role');

    const ventasConDetalle = await Promise.all(
      ventas.map(async (venta) => {
        const productosConDetalle = await Promise.all(
          venta.productos.map(async (p) => {
            const prodSQL = await Product.findOne({ where: { id: p.id_producto } });
            return {
              id_producto: p.id_producto,
              cantidad: p.cantidad,
              descripcion: prodSQL ? prodSQL.descripcion : 'Producto no encontrado',
              price: prodSQL ? prodSQL.price : 0,
            };
          })
        );

        return {
          _id: venta._id,
          fecha: venta.fecha,
          id_vendedor: venta.id_vendedor,
          id_cliente: venta.id_cliente,
          productos: productosConDetalle,
        };
      })
    );

    res.json(ventasConDetalle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});
// GET /api/ventas/mis-compras - para que cliente vea sus compras
router.get('/mis-compras', verifyToken, allowRoles('cliente'), async (req, res) => {
  try {
    const idCliente = req.user.id;

    const compras = await Venta.find({ id_cliente: idCliente })
      .populate('id_vendedor', 'name email role')
      .populate('id_cliente', 'name email role');

    const comprasConDetalle = await Promise.all(
      compras.map(async (venta) => {
        const productosConDetalle = await Promise.all(
          venta.productos.map(async (p) => {
            const prodSQL = await Product.findOne({ where: { id: p.id_producto } });
            return {
              id_producto: p.id_producto,
              cantidad: p.cantidad,
              descripcion: prodSQL ? prodSQL.descripcion : 'Producto no encontrado',
              price: prodSQL ? prodSQL.price : 0,
            };
          })
        );

        return {
          _id: venta._id,
          fecha: venta.fecha,
          id_vendedor: venta.id_vendedor,
          id_cliente: venta.id_cliente,
          productos: productosConDetalle,
        };
      })
    );

    res.json(comprasConDetalle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en servidor' });
  }
});


module.exports = router;
