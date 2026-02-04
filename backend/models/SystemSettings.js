const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    categories: {
        type: [String],
        default: [
            'Electronics',
            'Wallet/Purse',
            'Keys',
            'ID Card',
            'Books/Notes',
            'Clothing',
            'Bags/Backpacks',
            'Jewelry',
            'Sports Equipment',
            'Stationery',
            'Water Bottle',
            'Umbrella',
            'Glasses',
            'Watch',
            'Other'
        ]
    },
    allowRegistration: {
        type: Boolean,
        default: true
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Singleton pattern: Ensure only one document exists
systemSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) {
        return settings;
    }
    return await this.create({});
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
