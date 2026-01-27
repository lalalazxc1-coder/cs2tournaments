const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/authMiddleware');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage (Memory storage for validation)
const storage = multer.memoryStorage();

// Configure file filter (Basic check)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Magic Number Validation
const validateImageSignature = (buffer) => {
    const header = buffer.toString('hex', 0, 4);

    // JPEG/JPG: FF D8 FF
    if (header.startsWith('ffd8ff')) return 'jpg';

    // PNG: 89 50 4E 47
    if (header === '89504e47') return 'png';

    // GIF: 47 49 46 38
    if (header === '47494638') return 'gif';

    // WEBP: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
    // Need to check bytes 0-3 (RIFF) and 8-11 (WEBP)
    const riff = buffer.toString('hex', 0, 4);
    const webp = buffer.toString('hex', 8, 12);
    if (riff === '52494646' && webp === '57454250') return 'webp';

    return null;
};

// @route   POST /api/upload
// @desc    Upload an image
// @access  Private
router.post('/', authenticateToken, (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            console.error('Multer upload error:', err);
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            }
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate Magic Numbers
        const fileType = validateImageSignature(req.file.buffer);
        if (!fileType) {
            console.warn(`Security Warning: User ${req.user.userId} tried to upload invalid file signature.`);
            return res.status(400).json({ message: 'Invalid file content. Only real images are allowed.' });
        }

        // Generate filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname).toLowerCase();
        const filename = 'img-' + uniqueSuffix + ext;
        const filepath = path.join(uploadDir, filename);

        // Save file to disk
        try {
            await fs.promises.writeFile(filepath, req.file.buffer);

            const fileUrl = `/api/uploads/${filename}`;
            console.log('File uploaded successfully:', filename);

            res.json({
                message: 'File uploaded successfully',
                url: fileUrl
            });
        } catch (writeErr) {
            console.error('File write error:', writeErr);
            res.status(500).json({ message: 'Error saving file' });
        }
    });
});

module.exports = router;
