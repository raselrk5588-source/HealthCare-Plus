const Document = require('../models/Document');

// Save a new document or food item
exports.uploadDocument = async (req, res) => {
    try {
        const { phone, type, date, image, foodName, calories } = req.body;
        
        if (!phone || !type || !date) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const newDoc = new Document({
            phone,
            type,
            date,
            image,
            foodName,
            calories
        });

        const savedDoc = await newDoc.save();
        
        res.status(201).json({
            success: true,
            data: savedDoc
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Fetch documents by phone
exports.getDocuments = async (req, res) => {
    try {
        const { phone } = req.params;
        
        const documents = await Document.find({ phone }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete a document by ID
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const doc = await Document.findByIdAndDelete(id);
        
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }
        
        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
