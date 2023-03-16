const mongoose = require('mongoose');


const industrySchema = new mongoose.Schema({
    name: String,
    icon: String,
    color: String,
    date: { type: Date, default: Date.now }

})

exports.Industries = mongoose.model("Industries", industrySchema);