const express = require('express');
const router = express.Router();
const Venta = require('../models/Venta');
const Product = require('../models/Product');
const { verifyToken, allowRoles } = require('../middlewares/auth');

// GET /api/reportes/ventas
// Reporte resumen: total ventas, items vendidos, ingresos, ganancias, por día, por usuario y productos más vendidos
router.get('/ventas', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('id_vendedor', 'name')
      .populate('id_cliente', 'name');

    // Acumuladores
    const resumen = {
      totalVentas: ventas.length,
      totalItems: 0,
      ingresos: 0,
      ganancias: 0,
      ventasPorDia: {},
      ventasPorUsuario: {},
      productosMasVendidos: {},
    };

    for (const venta of ventas) {
      const fechaStr = venta.fecha.toISOString().slice(0, 10); // 'YYYY-MM-DD'

      // Ventas por día
      resumen.ventasPorDia[fechaStr] = resumen.ventasPorDia[fechaStr] || {
        ventas: 0,
        items: 0,
        ingresos: 0,
        ganancias: 0,
      };

      // Ventas por usuario (vendedor)
      const vendedorNombre = venta.id_vendedor?.name || 'Desconocido';
      resumen.ventasPorUsuario[vendedorNombre] = resumen.ventasPorUsuario[vendedorNombre] || {
        ventas: 0,
        items: 0,
        ingresos: 0,
        ganancias: 0,
      };

      resumen.ventasPorDia[fechaStr].ventas++;
      resumen.ventasPorUsuario[vendedorNombre].ventas++;

      for (const p of venta.productos) {
        const prodSQL = await Product.findOne({ where: { id: p.id_producto } });

        const cantidad = p.cantidad;
        const precioVenta = prodSQL ? prodSQL.price : 0;
        const costo = prodSQL ? prodSQL.cost_price : 0;
        const ganancia = (precioVenta - costo) * cantidad;

        resumen.totalItems += cantidad;
        resumen.ingresos += precioVenta * cantidad;
        resumen.ganancias += ganancia;

        resumen.ventasPorDia[fechaStr].items += cantidad;
        resumen.ventasPorDia[fechaStr].ingresos += precioVenta * cantidad;
        resumen.ventasPorDia[fechaStr].ganancias += ganancia;

        resumen.ventasPorUsuario[vendedorNombre].items += cantidad;
        resumen.ventasPorUsuario[vendedorNombre].ingresos += precioVenta * cantidad;
        resumen.ventasPorUsuario[vendedorNombre].ganancias += ganancia;

        // Productos más vendidos
        if (!resumen.productosMasVendidos[p.id_producto]) {
          resumen.productosMasVendidos[p.id_producto] = {
            descripcion: prodSQL ? prodSQL.descripcion : 'Producto no encontrado',
            cantidad: 0,
            ingresos: 0,
            ganancias: 0,
          };
        }
        resumen.productosMasVendidos[p.id_producto].cantidad += cantidad;
        resumen.productosMasVendidos[p.id_producto].ingresos += precioVenta * cantidad;
        resumen.productosMasVendidos[p.id_producto].ganancias += ganancia;
      }
    }

    // Convertir productosMasVendidos a array y ordenar por cantidad descendente
    resumen.productosMasVendidos = Object.entries(resumen.productosMasVendidos)
      .map(([id_producto, info]) => ({ id_producto, ...info }))
      .sort((a, b) => b.cantidad - a.cantidad);

    res.json(resumen);
  } catch (error) {
    console.error('Error generando reporte de ventas:', error);
    res.status(500).json({ error: 'Error generando reporte de ventas' });
  }
});

module.exports = router;
