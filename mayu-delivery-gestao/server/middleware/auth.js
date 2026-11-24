const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
 const authHeader = req.headers['authorization'];
 const token = authHeader && authHeader.split(' ')[1];

 if (!token) {
 return res.status(401).json({ error: 'Token de acesso não fornecido' });
 }

 jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
 if (err) {
 return res.status(403).json({ error: 'Token inválido ou expirado' });
 }
 req.user = user;
 next();
 });
};

const authorizeRoles = (...roles) => {
 return (req, res, next) => {
 if (!roles.includes(req.user.role)) {
 return res.status(403).json({ error: 'Acesso não autorizado' });
 }
 next();
 };
};

module.exports = { authenticateToken, authorizeRoles };