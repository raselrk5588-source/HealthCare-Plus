const express = require('express');
const router = express.Router();
const { 
    getDashboardData, 
    updateProfile, 
    addMedicine, 
    deleteMedicine, 
    updateMedicine,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    clearDashboardData
} = require('../controllers/dashboardController');

// Get all data
router.get('/:phone', getDashboardData);

// Update Profile
router.put('/:phone/profile', updateProfile);

// Medicine
router.post('/:phone/medicine', addMedicine);
router.put('/:phone/medicine/:medId', updateMedicine);
router.delete('/:phone/medicine/:medId', deleteMedicine);

// Health Record
router.post('/:phone/health', addHealthRecord);
router.put('/:phone/health/:id', updateHealthRecord);
router.delete('/:phone/health/:id', deleteHealthRecord);

// Clear Data
router.delete('/:phone/clear', clearDashboardData);

module.exports = router;
