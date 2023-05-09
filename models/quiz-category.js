const mongoose = require('mongoose');

const quizCategorySchema = mongoose.Schema({
    name: {
        type: String,

    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    }
})


quizCategorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

quizCategorySchema.set('toJSON', {
    virtuals: true,
});

exports.Quiz_Category = mongoose.model('Quiz_Category', quizCategorySchema);
