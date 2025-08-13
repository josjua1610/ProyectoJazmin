const jwt = require('jsonwebtoken');
const SECRET = 'tu_secreto_para_jwt';

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // id y role
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  };
}

module.exports = { verifyToken, allowRoles };
