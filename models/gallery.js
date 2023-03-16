const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
 
    description: {
        type: String,
        required: true
    },
    richdescription: {
        type: String,
        default: ''
    },
    video: {
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


gallerySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

gallerySchema.set('toJSON', {
    virtuals: true,
});

exports.Gallery = mongoose.model('Gallery', gallerySchema);
