const mongoose = require('mongoose');

const stateCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: { 
        type: String,
    }
})


stateCategorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

stateCategorySchema.set('toJSON', {
    virtuals: true,
});

exports.stateCategory = mongoose.model('stateCategory', stateCategorySchema);
