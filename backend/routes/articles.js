const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, allowRoles } = require('../middlewares/auth');

// Listar productos (publico o protegido)
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Crear producto (solo admin)
router.post('/', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const { descripcion, price, stock } = req.body;
    if (!descripcion || !price || !stock) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const newProduct = await Product.create({ descripcion, price, stock });
    res.status(201).json({ message: 'Producto creado', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Modificar producto (solo admin)
router.put('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const { descripcion, price, stock } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    product.descripcion = descripcion || product.descripcion;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    await product.save();

    res.json({ message: 'Producto actualizado', product });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    await product.destroy();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
