const { string } = require('joi');
const mongoose = require('mongoose');

const quizResource = mongoose.Schema({
    name: {
        type: String
    },

    email: {
        type: String
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

    quiz_category: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz_Category'
        }
    ,
    description: { type: String },
    richdescription: { type: String },
    status: {
        type: String
    },
    uploadName: {
        type: String
    },
    upload: {
        type: Boolean,
        default: true
    },
    owner: {
        type: String
    },
    owneremail: {
        type: String
    },


    isFeatured: {
        type: Boolean,
        default: false
    },

    isHomeFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

quizResource.virtual('id').get(function () {
    return this._id.toHexString();
});

quizResource.set('toJSON', {
    virtuals: true
});

exports.QuizList = mongoose.model('QuizList', quizResource);
