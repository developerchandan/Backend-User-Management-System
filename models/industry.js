const mongoose = require('mongoose');


const industrySchema = new mongoose.Schema({
    name: String,
    icon: String,
    color: String,
    date: { type: Date, default: Date.now }

})
industrySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

industrySchema.set('toJSON', {
    virtuals: true,
});

exports.Industries = mongoose.model("Industries", industrySchema);