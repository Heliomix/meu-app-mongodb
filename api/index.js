require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, client } = require('../db');

const app = express();
app.use(cors());
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
 res.json({
 message: 'API do Projeto MongoDB Atlas',
 endpoints: [
 'GET /api/usuarios - Listar todos os usuários',
 'POST /api/usuarios - Criar novo usuário',
 'GET /api/usuarios/:id - Buscar usuário por ID'
 ]
 });
});

// GET - Listar todos os usuários
app.get('/api/usuarios', async (req, res) => {
 try {
 const db = client.db('meu_projeto');
 const collection = db.collection('usuarios');
 const usuarios = await collection.find({}).toArray();
 res.json(usuarios);
 } catch (error) {
 res.status(500).json({ error: error.message });
 }
});

// POST - Criar novo usuário
app.post('/api/usuarios', async (req, res) => {
 try {
 const { nome, email, cargo } = req.body;

 if (!nome || !email) {
 return res.status(400).json({ error: 'Nome e email são obrigatórios' });
 }

 const db = client.db('meu_projeto');
 const collection = db.collection('usuarios');
 const resultado = await collection.insertOne({ nome, email, cargo, createdAt: new Date() });

 res.status(201).json({
 message: 'Usuário criado com sucesso',
 id: resultado.insertedId
 });
 } catch (error) {
 res.status(500).json({ error: error.message });
 }
});

// GET - Buscar usuário por ID
app.get('/api/usuarios/:id', async (req, res) => {
 try {
 const { ObjectId } = require('mongodb');
 const db = client.db('meu_projeto');
 const collection = db.collection('usuarios');
 const usuario = await collection.findOne({ _id: new ObjectId(req.params.id) });

 if (!usuario) {
 return res.status(404).json({ error: 'Usuário não encontrado' });
 }

 res.json(usuario);
 } catch (error) {
 res.status(500).json({ error: error.message });
 }
});

module.exports = app;