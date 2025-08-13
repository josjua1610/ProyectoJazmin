const mongoose = require('mongoose');

async function connectMongo() {
  try {
    await mongoose.connect('mongodb+srv://ericksuacos30:313420313@clustereyhs.rik7vbx.mongodb.net/tienda?retryWrites=true&w=majority&appName=ClusterEYHS', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  }
}

module.exports = connectMongo;
