const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
 destination: './uploads/invoices/',
 filename: (req, file, cb) => {
 cb(null, `invoice-${Date.now()}${path.extname(file.originalname)}`);
 }
});

const upload = multer({ storage: storage });

// Listar todas as notas fiscais
router.get('/', authenticateToken, async (req, res) => {
 try {
 const result = await pool.query(`
 SELECT i.*, s.company_name as supplier_name, u.name as user_name
 FROM invoices i
 JOIN suppliers s ON i.supplier_id = s.id
 JOIN users u ON i.user_id = u.id
 ORDER BY i.created_at DESC
 `);
 res.json(result.rows);
 } catch (error) {
 console.error('Erro ao buscar notas fiscais:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

// Upload de nota fiscal com OCR
router.post('/upload', authenticateToken, upload.single('invoice'), async (req, res) => {
 try {
 if (!req.file) {
 return res.status(400).json({ error: 'Nenhum arquivo enviado' });
 }

 // Aqui seria implementado o OCR com Tesseract.js
 // Por enquanto, vamos apenas registrar o upload

 res.status(201).json({
 message: 'Arquivo enviado com sucesso',
 file_path: req.file.path,
 note: 'OCR será implementado na Etapa 4'
 });
 } catch (error) {
 console.error('Erro ao fazer upload da nota fiscal:', error);
 res.status(500).json({ error: 'Erro interno do servidor' });
 }
});

module.exports = router;