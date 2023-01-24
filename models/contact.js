const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    mobile: { 
        type: String,
    },
    message: { 
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
