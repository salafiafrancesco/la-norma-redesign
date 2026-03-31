import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export default function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    req.admin = jwt.verify(header.slice(7), JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
