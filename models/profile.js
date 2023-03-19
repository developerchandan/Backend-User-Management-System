const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    currentRole: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
    },
    KRAs: { 
        type: String,
    },
    KPIs: { 
        type: String,
    },
    futureRole:String,
    selfAssessment:String,

   

})


profileSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

profileSchema.set('toJSON', {
    virtuals: true,
});

exports.Profile = mongoose.model('Profile', profileSchema);
