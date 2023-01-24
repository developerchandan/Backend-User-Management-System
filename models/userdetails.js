const mongoose = require('mongoose');

const userDetailSchema = mongoose.Schema({


    userprofile: {
        name: String,
        email: String,
        phone:String,
        address: String,
        userid:String,
        owner: String,
        owneremail: String
        
    },


})

userDetailSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userDetailSchema.set('toJSON', {
    virtuals: true,
});


exports.UserDetails = mongoose.model('UserDetails', userDetailSchema);
