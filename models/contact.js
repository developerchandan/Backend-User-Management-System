const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    name: {
        type: String,
        
    },
    email: {
        type: String,
    },
    contact: { 
        type: String,
    },
    message: { 
        type: String,
    },
    company: { 
        type: String,
    },
    isPrivacyPolicy: {
        type: Boolean,
        default: false,
    },
    newsletter:{
        type: String, 
    }

})


contactSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

contactSchema.set('toJSON', {
    virtuals: true,
});

exports.Contact = mongoose.model('Contact', contactSchema);
