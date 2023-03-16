const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
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


blogSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

blogSchema.set('toJSON', {
    virtuals: true,
});

exports.Blog = mongoose.model('Blog', blogSchema);
