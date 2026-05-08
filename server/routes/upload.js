import { Router } from 'express';
import multer from 'multer';
import { extname } from 'path';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';

const router = Router();
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const BUCKET = 'uploads';

// Use memory storage (no disk writes — file goes straight to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
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

function handleMulterError(error, _req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File is too large. Maximum size is 8 MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  if (error) {
    return res.status(400).json({ error: error.message || 'Upload failed.' });
  }
  return next();
}

// Ensure the storage bucket exists (called once)
let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
  bucketReady = true;
}

router.post('/', requireAuth, upload.single('image'), handleMulterError, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file was provided.' });
  }

  try {
    await ensureBucket();

    const extension = extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.floor(Math.random() * 1e6)}${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    return res.json({
      url: urlData.publicUrl,
      filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('[upload/create]', error);
    return res.status(500).json({ error: 'Unable to upload the file.' });
  }
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    await ensureBucket();

    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list('', { sortBy: { column: 'created_at', order: 'desc' } });

    if (error) throw error;

    const result = (files || [])
      .filter((f) => !f.name.startsWith('.'))
      .map((f) => {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
        return {
          filename: f.name,
          url: urlData.publicUrl,
          size: f.metadata?.size ?? 0,
          created: f.created_at,
        };
      });

    res.json(result);
  } catch (error) {
    console.error('[upload/list]', error);
    res.status(500).json({ error: 'Unable to list uploaded files.' });
  }
});

router.delete('/:filename', requireAuth, async (req, res) => {
  try {
    await ensureBucket();

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([req.params.filename]);

    if (error) throw error;
    return res.json({ message: 'Image deleted.' });
  } catch (error) {
    console.error('[upload/delete]', error);
    return res.status(500).json({ error: 'Unable to delete the file.' });
  }
});

export default router;
