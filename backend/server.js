require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 4002;

const path = require('path');
// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to be loaded
app.use(morgan('dev'));

// Static serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection middleware for Serverless
app.use(async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('Connected to MongoDB');
        }
        next();
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Root Route for testing
app.get('/', (req, res) => {
    res.send('HealthCare Plus API is running successfully!');
});

// Routes
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payment', paymentRoutes);

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`HealthCare Plus Backend running on port ${PORT}`);
    });
}

module.exports = app;
