import { Router } from 'express';
import multer from 'multer';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import requireAuth from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = join(__dirname, '..', 'uploads');

if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext  = extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.floor(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (allowed.includes(extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
  },
});

const router = Router();

// POST /api/upload  — upload image (admin)
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename, size: req.file.size });
});

// GET /api/upload  — list files (admin)
router.get('/', requireAuth, (_req, res) => {
  const files = readdirSync(UPLOADS_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map(f => {
      const st = statSync(join(UPLOADS_DIR, f));
      return { filename: f, url: `/uploads/${f}`, size: st.size, created: st.mtime };
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));
  res.json(files);
});

// DELETE /api/upload/:filename  — delete file (admin)
router.delete('/:filename', requireAuth, (req, res) => {
  const filename = basename(req.params.filename);
  const filepath = join(UPLOADS_DIR, filename);
  if (!existsSync(filepath)) return res.status(404).json({ error: 'File not found' });
  unlinkSync(filepath);
  res.json({ message: 'File deleted' });
});

export default router;
