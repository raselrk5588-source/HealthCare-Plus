const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        required: true
    },
    feeAmount: {
        type: Number,
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    patientAge: {
        type: Number,
        required: true
    },
    patientPhone: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    paymentId: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
