const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI não está definido. Configure o arquivo .env');
}

const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB Atlas com sucesso!');
    return client;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB Atlas:', error);
    throw error;
  }
}

module.exports = { connectDB, client };