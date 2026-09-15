const axios = require('axios');
const Appointment = require('../models/Appointment');

const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://checkout.sandbox.bka.sh/v1.2.0-beta';
const BKASH_APP_KEY = process.env.BKASH_APP_KEY || 'your_app_key_here';
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET || 'your_app_secret_here';
const BKASH_USERNAME = process.env.BKASH_USERNAME || 'your_username_here';
const BKASH_PASSWORD = process.env.BKASH_PASSWORD || 'your_password_here';

// Helper to check if credentials are mock/empty
const isMock = () => {
    return BKASH_APP_KEY === 'your_app_key_here' || !BKASH_APP_KEY;
};

// 1. Get Token from bKash
const grantToken = async () => {
    if (isMock()) return 'MOCK_TOKEN';

    const response = await axios.post(
        `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
        { app_key: BKASH_APP_KEY, app_secret: BKASH_APP_SECRET },
        { headers: { username: BKASH_USERNAME, password: BKASH_PASSWORD, 'Content-Type': 'application/json' } }
    );
    return response.data.id_token;
};

// 2. Create Payment (Initiate)
exports.createPayment = async (req, res) => {
    try {
        const { doctorName, feeAmount, patientName, patientAge, patientPhone } = req.body;
        
        // 1. Save pending appointment in DB
        const newAppointment = new Appointment({
            doctorName,
            feeAmount,
            patientName,
            patientAge,
            patientPhone,
            paymentStatus: 'PENDING'
        });
        await newAppointment.save();

        const callbackURL = `http://localhost:4002/api/v1/payment/bkash/callback?appointmentId=${newAppointment._id}`;

        // 2. If mock, simulate bKash payment URL
        if (isMock()) {
            console.log('Mocking bKash Payment URL generation...');
            const mockBkashUrl = `http://localhost:3000/mock-bkash.html?paymentID=MOCK_PAY_${Date.now()}&callbackURL=${encodeURIComponent(callbackURL)}`;
            return res.status(200).json({ success: true, paymentUrl: mockBkashUrl });
        }

        // 3. Real bKash Create Payment
        const token = await grantToken();
        const payload = {
            mode: '0011', // Checkout
            payerReference: patientPhone,
            callbackURL: callbackURL,
            amount: feeAmount,
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: `INV-${Date.now()}`
        };

        const response = await axios.post(
            `${BKASH_BASE_URL}/tokenized/checkout/create`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'X-APP-Key': BKASH_APP_KEY
                }
            }
        );

        if (response.data && response.data.statusCode === '0000') {
            return res.status(200).json({ success: true, paymentUrl: response.data.bkashURL });
        } else {
            console.error('bKash Create Payment Error:', response.data);
            return res.status(400).json({ success: false, message: response.data.statusMessage });
        }

    } catch (error) {
        console.error('Error creating bKash payment:', error.response?.data || error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// 3. Execute Payment Callback
exports.executePaymentCallback = async (req, res) => {
    try {
        const { paymentID, status, appointmentId } = req.query;

        const frontendSuccessUrl = `http://localhost:3000/payment-success.html?appointmentId=${appointmentId}`;
        const frontendFailedUrl = `http://localhost:3000/doctors.html?payment=failed`;

        if (status === 'cancel' || status === 'failure') {
            // Update DB as failed
            if (appointmentId) {
                await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'FAILED' });
            }
            return res.redirect(frontendFailedUrl);
        }

        if (isMock()) {
            console.log('Mocking bKash Payment Execution...');
            if (appointmentId) {
                await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'PAID' });
            }
            return res.redirect(frontendSuccessUrl);
        }

        // Real Execution
        const token = await grantToken();
        const response = await axios.post(
            `${BKASH_BASE_URL}/tokenized/checkout/execute`,
            { paymentID },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    'X-APP-Key': BKASH_APP_KEY
                }
            }
        );

        if (response.data && response.data.statusCode === '0000') {
            // Payment successful
            if (appointmentId) {
                await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'PAID' });
            }
            return res.redirect(frontendSuccessUrl);
        } else {
            console.error('bKash Execute Payment Error:', response.data);
            if (appointmentId) {
                await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'FAILED' });
            }
            return res.redirect(frontendFailedUrl);
        }
    } catch (error) {
        console.error('Error executing bKash payment:', error.response?.data || error.message);
        return res.redirect(`http://localhost:3000/doctors.html?payment=error`);
    }
};
