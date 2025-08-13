const { DataTypes } = require('sequelize');
const sequelize = require('../db.mysql.js');

const Product = sequelize.define('Product', {
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cost_price: {               // <-- Nuevo campo
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'products',
  timestamps: false,
});

module.exports = Product;
