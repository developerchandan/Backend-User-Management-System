const mongoose = require('mongoose');


const departmentSchema = new mongoose.Schema({
    name: String,
    icon: String,
    color: String,
    date: { type: Date, default: Date.now }

})

departmentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

departmentSchema.set('toJSON', {
    virtuals: true,
});


exports.Department = mongoose.model("Department", departmentSchema);