const mongoose = require('mongoose');

const newsletterSchema = mongoose.Schema({
   
    newsletter:{
        type: String, 
    }

})

newsletterSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

newsletterSchema.set('toJSON', {
    virtuals: true,
});

exports.Newsletter = mongoose.model('Newsletter', newsletterSchema);
