const mongoose = require('mongoose');

const privacyPolicySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
 
    shortDescription: {
        type: String,
        
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
 
    dateCreated: {
        type: Date,
        default: Date.now,
    },

})


privacyPolicySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

privacyPolicySchema.set('toJSON', {
    virtuals: true,
});

exports.PrivacyPolicy = mongoose.model('PrivacyPolicy', privacyPolicySchema);
