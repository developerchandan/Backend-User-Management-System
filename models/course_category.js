const mongoose = require('mongoose');

const courseCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    duration: {
        type: String,
    },
    mode:{
        type: String,
    },
    color: { 
        type: String,
    }
})


courseCategorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

courseCategorySchema.set('toJSON', {
    virtuals: true,
});

exports.Coursecategory = mongoose.model('Coursecategory', courseCategorySchema);
