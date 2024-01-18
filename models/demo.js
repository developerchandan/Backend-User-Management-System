const mongoose = require('mongoose');

const requestDemoSchema = mongoose.Schema({
    name: {
        type: String,
        required:true,
    },
    email: {
        type: String,
        required:true,
        unique:true
    },
    phone: {
        type: String,
        required:true,
    },
    role: {
        type: String,
        required:true,
    },
    company:{
        type:String,
    }
   
   
});

requestDemoSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

requestDemoSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('RequestDemo', requestDemoSchema);

