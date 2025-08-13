const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const connectMongo = require('./db.mongo');
const User = require('./models/User');
const ventasRoutes = require('./routes/ventas');
const articlesRoutes = require('./routes/articles');  // Rutas SQL para productos
const usersRoutes = require('./routes/users');
const reportesRoutes = require('./routes/reportes');



const sequelize = require('./db.mysql.js');  // Conexión MySQL Sequelize
const Product = require('./models/Product'); // Modelo Sequelize (para que sync funcione)

const app = express();
const PORT = 8000;
const SECRET = 'tu_secreto_para_jwt'; // Mejor en .env

connectMongo();

app.use(cors());
app.use(express.json());

app.use('/api/ventas', ventasRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/users', usersRoutes);
app.use('/mapas', express.static(path.join(__dirname, '../backend-python/routes')));
app.use('/api/reportes', reportesRoutes);


// Registro de usuario (MongoDB)
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword, role });
    console.log('Usuario creado:', newUser);

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login de usuario (MongoDB)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      token,
      role: user.role,
      name: user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

// Sincronizar Sequelize (MySQL) y luego arrancar servidor
sequelize.sync()
  .then(() => {
    console.log('MySQL sincronizado con Sequelize');
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error sincronizando MySQL:', err);
  });
