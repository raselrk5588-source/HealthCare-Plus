const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cmsController = require('../controllers/cmsController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Bulk data fetch for frontend rendering
router.get('/data', cmsController.getAllData);

// Image upload endpoint
router.post('/upload', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Return the URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
});

// Generic endpoints for any type (hospital, pharmacy, disease, etc.)
router.get('/:type', cmsController.getItems);
router.post('/:type', protect, cmsController.addItem);
router.put('/:type/:id', protect, cmsController.updateItem);
router.delete('/:type/:id', protect, cmsController.deleteItem);

module.exports = router;
