const mongoose =require('mongoose');

 const unMaskSchema=new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  },
  psychometricId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HumanR',
    
  },
  reportA: {
    type: Object, 
    
  },
    questionAndAnswer: [
        {
          question: {
            type: String,
            required: true,
          },
          answer: {
            type: [String],
            required: true,
          },
         
        },
      ],

},
{timestamps:true})

exports.UnMask = mongoose.model("UnMask", unMaskSchema);
