const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    routine: { type: String, required: true },
    timing: { type: String }
});

const healthRecordSchema = new mongoose.Schema({
    id: { type: String, required: true },
    date: { type: String, required: true },
    bpSys: { type: String },
    bpDia: { type: String },
    sugar: { type: String },
    hr: { type: String },
    cr: { type: String },
    height: { type: String },
    weight: { type: String }
});

const dashboardDataSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: { type: String, default: '' },
    age: { type: String, default: '' },
    medicines: [medicineSchema],
    healthHistory: [healthRecordSchema]
}, { timestamps: true });

module.exports = mongoose.model('DashboardData', dashboardDataSchema);
