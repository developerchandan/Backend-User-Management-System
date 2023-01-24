const mongoose = require('mongoose');

const resultSchema = mongoose.Schema({
    name: {
        type: String
    },
    courseName: {
        type: String
    },
    university: {
        type: String
    },
    url: {
        type: String
    },
    examDate:{
        type:String 
    },
    location:{
        type:String
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

    statecategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'stateCategory'
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

resultSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

resultSchema.set('toJSON', {
    virtuals: true
});

exports.Result = mongoose.model('Result', resultSchema);
