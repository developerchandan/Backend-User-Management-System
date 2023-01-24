const mongoose = require('mongoose');

const UploadQuizSchema = mongoose.Schema({
    name: {
        type: String,

    },
    description: {
        type: String,

    },
    status: {
        type: String,

    },
    uploadName: {
        type: String,

    },


    owner: {
        type: String,
    },
    owneremail: {
        type: String,
    }

})

UploadQuizSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UploadQuizSchema.set('toJSON', {
    virtuals: true
});

exports.UploadQuiz = mongoose.model('UploadQuiz', UploadQuizSchema);