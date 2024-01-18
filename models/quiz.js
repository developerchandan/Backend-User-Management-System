const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    questionText: {
        type: String,
       
    },
    answer: {
        type: String,
        
    },
    options: {
        type: Array,
        default: [],
    },
});

const quizResourceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            default: '',
        },

        category: {
            type: [String],
            default: [],
        },
        subCategory: {
            type: [String],
            default: [],
        },
        mcqs: [questionSchema],
        description: {
            type: String,
        },
        richdescription: {
            type: String,
        },
        status: {
            type: String,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isHomeFeatured: {
            type: Boolean,
            default: false,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

quizResourceSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

quizResourceSchema.set('toJSON', {
    virtuals: true,
});

const QuizList = mongoose.model('QuizList', quizResourceSchema);

module.exports = QuizList;
