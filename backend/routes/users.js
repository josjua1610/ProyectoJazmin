const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { verifyToken, allowRoles } = require('../middlewares/auth');

// Listar todos los usuarios (solo admin)
router.get('/', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // no mostrar contraseña
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear nuevo usuario (solo admin)
router.post('/', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'Usuario creado', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Modificar usuario (solo admin)
router.put('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const userUpdated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!userUpdated) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario actualizado', user: userUpdated });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario (solo admin)
router.delete('/:id', verifyToken, allowRoles('admin'), async (req, res) => {
  try {
    const userDeleted = await User.findByIdAndDelete(req.params.id);
    if (!userDeleted) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Listar solo clientes (vendedores y admins pueden acceder)
router.get('/clientes', verifyToken, allowRoles('admin', 'vendedor'), async (req, res) => {
  try {
    const clientes = await User.find({ role: 'cliente' }).select('-password');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

module.exports = router;
