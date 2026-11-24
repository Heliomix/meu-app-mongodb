const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const pool = require('../config/database');

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limite
});

// Rota para processar imagem de nota fiscal
router.post('/process-invoice', upload.single('invoice'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    console.log('Processando imagem da nota fiscal...');

    // Processar a imagem com Tesseract OCR
    const { data: { text } } = await Tesseract.recognize(
      req.file.buffer,
      'por', // Português
      {
        logger: m => console.log(m)
      }
    );

    console.log('Texto extraído:', text);

    // Extrair informações do texto usando regex
    const products = extractProducts(text);
    const supplier = extractSupplier(text);
    const total = extractTotal(text);

    res.json({
      success: true,
      extractedData: {
        products,
        supplier,
        total,
        rawText: text
      }
    });

  } catch (error) {
    console.error('Erro ao processar nota fiscal:', error);
    res.status(500).json({ error: 'Erro ao processar imagem' });
  }
});

// Função para extrair produtos do texto
function extractProducts(text) {
  const products = [];
  const lines = text.split('\n');

  // Padrões comuns em notas fiscais brasileiras
  const productPatterns = [
    /(\d+)\s+([A-Za-z0-9\s\.]+?)\s+(\d+[,.]?\d*)\s+x\s+(\d+[,.]?\d*)/g,
    /([A-Za-z0-9\s\.]+?)\s+(\d+[,.]?\d*)\s+x\s+(\d+[,.]?\d*)/g,
  ];

  for (const line of lines) {
    // Procurar padrões de produtos (código, descrição, quantidade, preço)
    for (const pattern of productPatterns) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        products.push({
          code: match[1] || null,
          name: match[2]?.trim() || match[1]?.trim(),
          quantity: parseFloat((match[3] || match[2] || '1').replace(',', '.')),
          price: parseFloat((match[4] || match[3] || '0').replace(',', '.'))
        });
      }
    }
  }

  // Se não encontrou com os padrões acima, tentar extrair linhas que parecem produtos
  if (products.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 3 && trimmed.length < 100 && /\d/.test(trimmed)) {
        // Tentar extrair preço da linha
        const priceMatch = trimmed.match(/\d+[,.]\d{2}(?!\d)/);
        if (priceMatch) {
          products.push({
            name: trimmed.replace(priceMatch[0], '').trim(),
            price: parseFloat(priceMatch[0].replace(',', '.')),
            quantity: 1
          });
        }
      }
    }
  }

  return products.slice(0, 20); // Limitar a 20 produtos
}

// Função para extrair informações do fornecedor
function extractSupplier(text) {
  const supplier = {};

  // Procurar CNPJ
  const cnpjMatch = text.match(/\d{2}[\.]?\d{3}[\.]?\d{3}[\/]?\d{4}[-]?\d{2}/);
  if (cnpjMatch) {
    supplier.cnpj = cnpjMatch[0];
  }

  // Procurar nome da empresa (linhas iniciais geralmente contêm o nome)
  const lines = text.split('\n').slice(0, 10);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 5 && trimmed.length < 50 && !/^\d+$/.test(trimmed)) {
      supplier.company_name = trimmed;
      break;
    }
  }

  // Procurar telefone
  const phoneMatch = text.match(/\(?\d{2}\)?\s?\d{4,5}[-]?\d{4}/);
  if (phoneMatch) {
    supplier.phone = phoneMatch[0];
  }

  return Object.keys(supplier).length > 0 ? supplier : null;
}

// Função para extrair valor total
function extractTotal(text) {
  const patterns = [
    /total\s*[:.]?\s*(\d+[,.]\d{2})/i,
    /valor\s*total\s*[:.]?\s*(\d+[,.]\d{2})/i,
    /R\$\s*(\d+[,.]\d{2})/g
  ];

  let total = null;

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      total = parseFloat(lastMatch[1].replace(',', '.'));
      break;
    }
  }

  return total;
}

// Rota para atualizar produtos com dados extraídos
router.post('/update-products-from-invoice', async (req, res) => {
  try {
    const { products, supplierName } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const updatedProducts = [];
    const newProducts = [];
    const invoiceItems = [];

    // Calcular número da semana e ano atual
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDays = (now - startOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
    const year = now.getFullYear();

    for (const product of products) {
      const price = parseFloat(product.price) || 0;
      const quantity = parseFloat(product.quantity) || 0;
      const totalPrice = price * quantity;

      // Verificar se o produto já existe pelo nome
      const existing = await pool.query(
        'SELECT id FROM products WHERE LOWER(name) LIKE LOWER($1)',
        [`%${product.name}%`]
      );

      if (existing.rows.length > 0) {
        // Atualizar produto existente
        const result = await pool.query(
          'UPDATE products SET last_purchase_price = $1, current_quantity = current_quantity + $2 WHERE id = $3 RETURNING *',
          [price, quantity, existing.rows[0].id]
        );
        updatedProducts.push(result.rows[0]);
      } else {
        // Criar novo produto
        const result = await pool.query(
          'INSERT INTO products (name, last_purchase_price, current_quantity) VALUES ($1, $2, $3) RETURNING *',
          [product.name, price, quantity]
        );
        newProducts.push(result.rows[0]);
      }

      // Salvar no histórico de notas fiscais
      await pool.query(
        'INSERT INTO invoice_history (supplier_name, product_name, quantity, unit_price, total_price, week_number, year) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [supplierName || 'Desconhecido', product.name, quantity, price, totalPrice, weekNumber, year]
      );

      invoiceItems.push({
        product_name: product.name,
        quantity,
        unit_price: price,
        total_price: totalPrice
      });
    }

    res.json({
      success: true,
      updated: updatedProducts,
      created: newProducts,
      invoiceSummary: {
        weekNumber,
        year,
        items: invoiceItems,
        totalSpent: invoiceItems.reduce((sum, item) => sum + item.total_price, 0)
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar produtos:', error);
    res.status(500).json({ error: 'Erro ao atualizar produtos' });
  }
});

// Rota para obter relatório de gastos semanais
router.get('/weekly-expenses', async (req, res) => {
 try {
 const { week, year } = req.query;

 let query = 'SELECT * FROM invoice_history';
 const params = [];

 if (week && year) {
 query += ' WHERE week_number = $1 AND year = $2';
 params.push(parseInt(week), parseInt(year));
 } else {
 // Se não especificado, pega a semana atual
 const now = new Date();
 const startOfYear = new Date(now.getFullYear(), 0, 1);
 const pastDays = (now - startOfYear) / 86400000;
 const currentWeek = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
 query += ' WHERE week_number = $1 AND year = $2';
 params.push(currentWeek, now.getFullYear());
 }

 query += ' ORDER BY created_at DESC';

 const result = await pool.query(query, params);

 // Agrupar por dia da semana
 const dailyExpenses = {};
 let totalSpent = 0;

 result.rows.forEach(row => {
 const date = new Date(row.created_at);
 const dayKey = date.toLocaleDateString('pt-BR');

 if (!dailyExpenses[dayKey]) {
 dailyExpenses[dayKey] = {
 date: dayKey,
 items: [],
 dailyTotal: 0
 };
 }

 dailyExpenses[dayKey].items.push({
 product_name: row.product_name,
 supplier_name: row.supplier_name,
 quantity: row.quantity,
 unit_price: row.unit_price,
 total_price: row.total_price
 });

 dailyExpenses[dayKey].dailyTotal += parseFloat(row.total_price);
 totalSpent += parseFloat(row.total_price);
 });

 res.json({
 success: true,
 weekNumber: week || new Date().getWeek ? new Date().getWeek() : 0,
 year: year || new Date().getFullYear(),
 totalSpent,
 dailyExpenses: Object.values(dailyExpenses),
 history: result.rows
 });

 } catch (error) {
 console.error('Erro ao buscar despesas semanais:', error);
 res.status(500).json({ error: 'Erro ao buscar despesas' });
 }
});

// Adicionar método getWeek ao prototype do Date se não existir
if (!Date.prototype.getWeek) {
 Date.prototype.getWeek = function() {
 const onejan = new Date(this.getFullYear(), 0, 1);
 return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
 };
}

module.exports = router;