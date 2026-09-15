const mongoose = require('mongoose');
require('dotenv').config();
const { Doctor } = require('./models/CmsModels');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare_plus').then(async () => {
    await Doctor.insertMany([
        { name: 'Dr. Anisur Rahman', degree: 'MBBS, MD (Cardiology)', institute: 'Dhaka Medical College', specialty: 'Cardiology', hospital: 'Square Hospital', district: 'ঢাকা', phone: '01711122233', visitingHours: '5 PM - 9 PM', fee: '1000' },
        { name: 'Dr. Salma Begum', degree: 'MBBS, FCPS (Neurology)', institute: 'BSMMU', specialty: 'Neurology', hospital: 'Labaid', district: 'ঢাকা', phone: '01822233344', visitingHours: '6 PM - 10 PM', fee: '1200' },
        { name: 'Dr. Rafiqul Islam', degree: 'MBBS, BCS (Health)', institute: 'Sir Salimullah Medical College', specialty: 'Medicine', hospital: 'Popular Diagnostic', district: 'ঢাকা', phone: '01933344455', visitingHours: '4 PM - 8 PM', fee: '800' }
    ]);
    console.log('Seeded doctors');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
