const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    collageName: {
        type: String
    },
    courseName: {
        type: String
    },
    fee: {
        type: String
    },
    courseDuration: {
        type: String
    },
    examAccepted: {
        type: String
    },
    studyMode: {
        type: String
    },

    overview: {
        type: String
    },
    highlight: {
        type: String
    },

    university: {
        type: String
    },
    url: {
        type: String
    },
    examDate: {
        type: String
    },
    location: {
        type: String
    },

    description: {
        type: String
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [
        {
            type: String
        }
    ],

    coursecategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coursecategory'
    },

    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

courseSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

courseSchema.set('toJSON', {
    virtuals: true
});

exports.Course = mongoose.model('Course', courseSchema);
