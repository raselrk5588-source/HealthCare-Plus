const DashboardData = require('../models/DashboardData');

// Get all dashboard data for a user
exports.getDashboardData = async (req, res) => {
    try {
        const { phone } = req.params;
        let data = await DashboardData.findOne({ phone });
        
        // Create if doesn't exist
        if (!data) {
            data = await DashboardData.create({ phone });
        }
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update profile (name, age)
exports.updateProfile = async (req, res) => {
    try {
        const { phone } = req.params;
        const { name, age } = req.body;
        
        const data = await DashboardData.findOneAndUpdate(
            { phone },
            { name, age },
            { new: true, upsert: true }
        );
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Add medicine
exports.addMedicine = async (req, res) => {
    try {
        const { phone } = req.params;
        const medicine = req.body;
        medicine.id = Date.now().toString();
        
        const data = await DashboardData.findOneAndUpdate(
            { phone },
            { $push: { medicines: medicine } },
            { new: true, upsert: true }
        );
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
    try {
        const { phone, medId } = req.params;
        
        const data = await DashboardData.findOneAndUpdate(
            { phone },
            { $pull: { medicines: { id: medId } } },
            { new: true }
        );
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Add health record
exports.addHealthRecord = async (req, res) => {
    try {
        const { phone } = req.params;
        const record = req.body;
        record.id = Date.now().toString();
        
        const data = await DashboardData.findOneAndUpdate(
            { phone },
            { $push: { healthHistory: record } },
            { new: true, upsert: true }
        );
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete all dashboard data (Clear Data button)
exports.clearDashboardData = async (req, res) => {
    try {
        const { phone } = req.params;
        
        // 1. Clear medicines and health history
        await DashboardData.findOneAndUpdate(
            { phone },
            { medicines: [], healthHistory: [] },
            { new: true }
        );
        
        // 2. Clear Food Scans (from Document collection)
        const Document = require('../models/Document');
        await Document.deleteMany({ phone, type: 'food' });
        
        res.status(200).json({ success: true, message: 'Data cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
    try {
        const { phone, medId } = req.params;
        const { name, routine, timing } = req.body;
        
        const data = await DashboardData.findOneAndUpdate(
            { phone, "medicines.id": medId },
            { $set: { 
                "medicines.$.name": name,
                "medicines.$.routine": routine,
                "medicines.$.timing": timing
            }},
            { new: true }
        );
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update health record
exports.updateHealthRecord = async (req, res) => {
    try {
        const { phone, id } = req.params;
        const { date, bpSys, bpDia, sugar, hr, cr, height, weight } = req.body;
        
        const data = await DashboardData.findOneAndUpdate(
            { phone, "healthHistory.id": id },
            { $set: {
                "healthHistory.$.date": date,
                "healthHistory.$.bpSys": bpSys,
                "healthHistory.$.bpDia": bpDia,
                "healthHistory.$.sugar": sugar,
                "healthHistory.$.hr": hr,
                "healthHistory.$.cr": cr,
                "healthHistory.$.height": height,
                "healthHistory.$.weight": weight
            }},
            { new: true }
        );
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete health record
exports.deleteHealthRecord = async (req, res) => {
    try {
        const { phone, id } = req.params;
        
        const data = await DashboardData.findOneAndUpdate(
            { phone },
            { $pull: { healthHistory: { id: id } } },
            { new: true }
        );
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
