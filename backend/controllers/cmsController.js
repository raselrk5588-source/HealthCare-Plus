const { Hospital, Pharmacy, BloodBank, Ambulance, Disease, HomeCare, Nutrition, Doctor } = require('../models/CmsModels');
const Appointment = require('../models/Appointment');

const distList = [
    "ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "নরসিংদী", "মুন্সীগঞ্জ", "কিশোরগঞ্জ", "মানিকগঞ্জ", "টাঙ্গাইল", "ফরিদপুর", "মাদারীপুর", "শরীয়তপুর", "রাজবাড়ী", "গোপালগঞ্জ",
    "চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "নোয়াখালী", "ফেনী", "লক্ষ্মীপুর", "খাগড়াছড়ি", "রাঙ্গামাটি", "বান্দরবান",
    "রাজশাহী", "বগুড়া", "নওগাঁ", "পাবনা", "সিরাজগঞ্জ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "জয়পুরহাট",
    "খুলনা", "যশোর", "সাতক্ষীরা", "বাগেরহাট", "চুয়াডাঙ্গা", "কুষ্টিয়া", "মেহেরপুর", "ঝিনাইদহ", "মাগুরা", "নড়াইল",
    "বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা", "ঝালকাঠি",
    "সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ",
    "রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও", "লালমনিরহাট",
    "ময়মনসিংহ", "জামালপুর", "নেত্রকোনা", "শেরপুর"
];

const getModelByType = (type) => {
    switch (type) {
        case 'hospitals': return Hospital;
        case 'pharmacies': return Pharmacy;
        case 'bloodBanks': return BloodBank;
        case 'ambulances': return Ambulance;
        case 'diseases': return Disease;
        case 'homeCare': return HomeCare;
        case 'nutrition': return Nutrition;
        case 'doctors': return Doctor;
        case 'appointments': return Appointment;
        default: return null;
    }
};

// Fetch all data formatted like the old mock_data.js
exports.getAllData = async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ _id: -1 });
        const pharmacies = await Pharmacy.find().sort({ _id: -1 });
        const bloodBanks = await BloodBank.find().sort({ _id: -1 });
        const ambulances = await Ambulance.find().sort({ _id: -1 });
        const diseases = await Disease.find().sort({ _id: -1 });
        const homeCare = await HomeCare.find().sort({ _id: -1 });
        const nutrition = await Nutrition.find().sort({ _id: -1 });
        const doctors = await Doctor.find().sort({ _id: -1 });

        res.json({
            districts: distList,
            hospitals,
            pharmacies,
            bloodBanks,
            ambulances,
            diseases,
            homeCare,
            nutrition,
            doctors
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch CMS data', details: err.message });
    }
};

// Generic CRUD operations
exports.getItems = async (req, res) => {
    const Model = getModelByType(req.params.type);
    if (!Model) return res.status(400).json({ error: 'Invalid type' });
    try {
        const items = await Model.find().sort({ _id: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addItem = async (req, res) => {
    const Model = getModelByType(req.params.type);
    if (!Model) return res.status(400).json({ error: 'Invalid type' });
    try {
        const newItem = new Model(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateItem = async (req, res) => {
    const Model = getModelByType(req.params.type);
    if (!Model) return res.status(400).json({ error: 'Invalid type' });
    try {
        const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    const Model = getModelByType(req.params.type);
    if (!Model) return res.status(400).json({ error: 'Invalid type' });
    try {
        await Model.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Temporary seed endpoint
exports.seedData = async (req, res) => {
    try {
        // You would pass the JSON body containing the mock_data exports here
        const data = req.body;
        if (data.hospitals) await Hospital.insertMany(data.hospitals);
        if (data.pharmacies) await Pharmacy.insertMany(data.pharmacies);
        if (data.bloodBanks) await BloodBank.insertMany(data.bloodBanks);
        if (data.ambulances) await Ambulance.insertMany(data.ambulances);
        if (data.diseases) await Disease.insertMany(data.diseases);
        if (data.homeCare) await HomeCare.insertMany(data.homeCare);
        if (data.nutrition) {
            for (const [category, items] of Object.entries(data.nutrition)) {
                await Nutrition.findOneAndUpdate(
                    { category },
                    { category, items },
                    { upsert: true }
                );
            }
        }
        res.json({ message: 'Seed successful' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
