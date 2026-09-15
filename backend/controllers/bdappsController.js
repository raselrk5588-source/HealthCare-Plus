const axios = require('axios');
const Appointment = require('../models/Appointment');

// Environment variables to be defined in .env
const APP_ID = process.env.BDAPPS_APP_ID;
const APP_PASSWORD = process.env.BDAPPS_APP_PASSWORD;

const CHARGE_API_URL = process.env.BDAPPS_CHARGE_URL || 'https://developer.bdapps.com/caas/direct/charge';

// 1. Direct Operator Billing (e.g., 4 BDT for Robi/Airtel)
exports.chargeDirect = async (req, res) => {
    try {
        const { subscriberId, amount } = req.body; // subscriberId e.g. 'tel:+88018...'

        if (!subscriberId || !amount) {
            return res.status(400).json({ success: false, message: 'subscriberId and amount are required' });
        }

        const payload = {
            applicationId: APP_ID,
            password: APP_PASSWORD,
            subscriberId: subscriberId,
            chargingAmount: amount, // 4.00
            chargingMetaData: 'App Access Charge',
            externalTrxId: `TXN${Date.now()}`
        };

        // Uncomment to actually call BDApps (mocked for now)
        /*
        const response = await axios.post(CHARGE_API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.data && response.data.statusCode === 'S1000') {
            return res.status(200).json({ success: true, data: response.data, message: 'Charging successful' });
        }
        */

        // MOCK RESPONSE FOR TESTING
        console.log('Mock BDApps Charge:', payload);
        return res.status(200).json({ success: true, data: { statusCode: 'S1000', statusDetail: 'Success' }, message: 'Charging successful (Mock)' });

    } catch (error) {
        console.error('Error in BDApps charging:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// 2. bKash Payment for Doctor Appointments (via BDApps)
exports.initiateBkashPayment = async (req, res) => {
    try {
        const { amount, referenceInfo } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'amount is required' });
        }

        // Mocking the BDApps bKash API response
        // In reality, BDApps gives a payment URL that we need to redirect the user to
        const mockPaymentUrl = `https://dummy.bdapps.com/bkash-pay?appId=${APP_ID || 'TEST'}&amount=${amount}`;
        
        console.log('Initiating bKash via BDApps for:', amount);

        return res.status(200).json({ 
            success: true, 
            paymentUrl: mockPaymentUrl,
            message: 'bKash payment initiated successfully via BDApps.'
        });

    } catch (error) {
         console.error('Error initiating bKash payment:', error);
         return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// 3. Webhook / Callback handler for BDApps
exports.paymentCallback = async (req, res) => {
    try {
        const callbackData = req.body;
        console.log('BDApps Payment Callback received:', callbackData);

        // Process status and update your DB (e.g., mark appointment as PAID)
        
        return res.status(200).json({
            success: true,
            message: 'Payment notification received'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Callback processing error' });
    }
};

// Book Appointment Logic
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorName, feeAmount, patientName, patientAge, patientPhone } = req.body;
        
        const newAppointment = new Appointment({
            doctorName,
            feeAmount,
            patientName,
            patientAge,
            patientPhone,
            paymentStatus: 'PENDING'
        });

        await newAppointment.save();

        res.status(201).json({
            success: true,
            appointmentId: newAppointment._id,
            message: 'Appointment booked successfully'
        });
    } catch (err) {
        console.error('Error booking appointment:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
