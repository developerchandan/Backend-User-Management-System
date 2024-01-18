
const mongoose =require('mongoose');

const assessmentSchema = new mongoose.Schema({
    answer: Number,
    name:String,
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subCompetencyList:[
        {
            subcompatency_name: String,
            answer: Number,
            subCompScore:Number,
            subBehaviourList: [
              {
                answer: Number,
                beahviourName: String,
                questionList: [
                  {
                    answer: Number,
                    questionText: String,
                    scale: String,
                    analysis: String,
                    selected_value: String,
                  },
                ],
              },
            ],
            subCompatencyAnalysis: [
              {
                analysis_name: String,
                analysis_range: String,
              
              },
            ],
        }
    ],
    summary:[
        {
            title:String,
            range:String,
            description:String,
        }
    ],
    psychometricResultId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanR',
    },
   
   
  },
  {timestamps:true});

assessmentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

assessmentSchema.set('toJSON', {
    virtuals: true
});

exports.Assessment = mongoose.model('Assessment', assessmentSchema);