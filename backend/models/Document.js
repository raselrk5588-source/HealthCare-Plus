const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    image: {
        type: String, // Base64 Data URL
        required: true
    },
    foodName: {
        type: String,
        default: null
    },
    calories: {
        type: Number,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
