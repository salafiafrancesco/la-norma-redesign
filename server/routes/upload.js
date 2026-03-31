import { Router } from 'express';
import multer from 'multer';
import { basename, extname, join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import requireAuth from '../middleware/auth.js';
import { UPLOADS_DIR } from '../config.js';

const router = Router();
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOADS_DIR),
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.floor(Math.random() * 1e6)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      callback(new Error('Only JPG, PNG, WEBP, and GIF files are allowed.'));
      return;
    }

    callback(null, true);
  },
});

router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file was provided.' });
  }

  return res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
  });
});

router.get('/', requireAuth, (_req, res) => {
  const files = readdirSync(UPLOADS_DIR)
    .filter((filename) => ALLOWED_EXTENSIONS.has(extname(filename).toLowerCase()))
    .map((filename) => {
      const stats = statSync(join(UPLOADS_DIR, filename));
      return {
        filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        created: stats.mtime,
      };
    })
    .sort((left, right) => new Date(right.created) - new Date(left.created));

  res.json(files);
});

router.delete('/:filename', requireAuth, (req, res) => {
  const filename = basename(req.params.filename);
  const filePath = join(UPLOADS_DIR, filename);

  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  unlinkSync(filePath);
  return res.json({ message: 'Image deleted.' });
});

export default router;
