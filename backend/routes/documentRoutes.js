const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');

// Upload a document or food item
router.post('/upload', uploadDocument);

// Get all documents for a specific phone number
router.get('/:phone', getDocuments);

// Delete a document
router.delete('/:id', deleteDocument);

module.exports = router;
