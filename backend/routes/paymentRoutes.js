const express = require('express');
const router = express.Router();
const bdappsController = require('../controllers/bdappsController');

// --- Old BDApps Routes (kept for reference) ---
router.post('/charge-direct', bdappsController.chargeDirect);
router.post('/bkash-initiate', bdappsController.initiateBkashPayment);
router.post('/callback', bdappsController.paymentCallback);
router.post('/book-appointment', bdappsController.bookAppointment);

// --- New Official bKash PGW Routes ---
const bkashController = require('../controllers/bkashController');

// This handles both booking the appointment and initiating bKash payment
router.post('/bkash/create', bkashController.createPayment);

// This handles the callback from bKash (success, cancel, failure)
router.get('/bkash/callback', bkashController.executePaymentCallback);

module.exports = router;
