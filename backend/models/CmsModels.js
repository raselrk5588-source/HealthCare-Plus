const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    district: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    hours: { type: String },
    depts: { type: String }
});

const PharmacySchema = new mongoose.Schema({
    district: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    hours: { type: String }
});

const BloodBankSchema = new mongoose.Schema({
    district: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true }
});

const AmbulanceSchema = new mongoose.Schema({
    district: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String }
});

const DiseaseSchema = new mongoose.Schema({
    id: { type: String, default: () => 'd_' + Date.now() },
    name: { type: String, required: true },
    overview: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    details: { type: String },
    dietInfo: { type: String }
});

const HomeCareSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    icon: { type: String },
    color: { type: String }
});

const NutritionSchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true }, // e.g., 'immunity', 'protein', 'dairy'
    items: [{
        name: { type: String },
        desc: { type: String },
        icon: { type: String },
        color: { type: String }
    }]
});

const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const DoctorSchema = new mongoose.Schema({
    district: { type: String, required: true },
    name: { type: String, required: true },
    degree: { type: String },
    institute: { type: String },
    specialty: { type: String, required: true },
    hospital: { type: String },
    phone: { type: String },
    visitingHours: { type: String },
    fee: { type: String },
    photo: { type: String }
});

module.exports = {
    Hospital: mongoose.model('Hospital', HospitalSchema),
    Pharmacy: mongoose.model('Pharmacy', PharmacySchema),
    BloodBank: mongoose.model('BloodBank', BloodBankSchema),
    Ambulance: mongoose.model('Ambulance', AmbulanceSchema),
    Disease: mongoose.model('Disease', DiseaseSchema),
    HomeCare: mongoose.model('HomeCare', HomeCareSchema),
    Nutrition: mongoose.model('Nutrition', NutritionSchema),
    Admin: mongoose.model('Admin', AdminSchema),
    Doctor: mongoose.model('Doctor', DoctorSchema)
};
