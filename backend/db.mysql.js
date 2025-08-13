const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tienda', 'root', '313420', {
  host: 'localhost',
  dialect: 'mysql',
});

sequelize.authenticate()
  .then(() => console.log('MySQL conectado'))
  .catch(err => console.error('Error en conexión MySQL:', err));

module.exports = sequelize;
