const sequelize = require('../backend/db.mysql.js');
const Product = require('../backend/models/Product');
const { faker } = require('@faker-js/faker');

async function loadProducts() {
  try {
    await sequelize.sync();

    // Borrar todos los productos antes de insertar
    await Product.destroy({ where: {}, truncate: true });

    const products = [];

    for (let i = 0; i < 200; i++) {
      const costPrice = parseFloat(faker.commerce.price(1, 50, 2));
      const salePrice = parseFloat((costPrice * (1 + Math.random())).toFixed(2)); // margen hasta 100%
      
      products.push({
        descripcion: faker.commerce.productName(),
        price: salePrice,
        cost_price: costPrice,
        stock: faker.number.int({ min: 0, max: 100 }),
      });
    }

    await Product.bulkCreate(products);
    console.log('200 productos cargados con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error cargando productos:', error);
    process.exit(1);
  }
}

loadProducts();
