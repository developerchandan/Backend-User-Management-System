const mongoose =require('mongoose');

const questionschema= mongoose.Schema({
    quizid: {
        type: String,
        required: true
    },
    questionId: {
        type: String,
        required: true
    },
    questionText:{
        type: String, 
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    options:{
        type  :Array,
        default:[]
    }

})

questionschema.virtual('id').get(function () {
    return this._id.toHexString();
});

questionschema.set('toJSON', {
    virtuals: true
});

exports.Question = mongoose.model('Question', questionschema);