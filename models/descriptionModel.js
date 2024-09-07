const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alertify',
        required: true,
    },
    description: {
        type: String,
        required: false, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const DescriptionModel = mongoose.model('Description', descriptionSchema);
module.exports = DescriptionModel;
