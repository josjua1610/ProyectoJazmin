const express = require('express');
const cors = require('cors');

const connectMongo = require('./db.mongo');
const User = require('./models/User');

const app = express();
const PORT = 8000;

connectMongo();

app.use(cors());
app.use(express.json());

// Productos en memoria (temporal)
const articles = [];

// Registro de usuario usando MongoDB
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'El usuario ya existe' });

    await User.create({ name, email, password });
    console.log('Usuario registrado:', { name, email });

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Login usuario usando MongoDB
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    // Token falso para demo
    const fakeToken = 'token-de-ejemplo-' + user.email;
    res.json({ token: fakeToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Registrar artículo (sigue en memoria)
app.post('/api/articles', (req, res) => {
  const { descripcion, price, stock } = req.body;

  if (!descripcion || price == null || stock == null) {
    return res.status(400).json({ error: 'Faltan datos del artículo' });
  }

  const newArticle = { id: articles.length + 1, descripcion, price, stock };
  articles.push(newArticle);

  console.log('Artículo registrado:', newArticle);

  res.status(201).json({ message: 'Artículo registrado correctamente', article: newArticle });
});

// Listar artículos
app.get('/api/articles', (req, res) => {
  res.json(articles);
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
