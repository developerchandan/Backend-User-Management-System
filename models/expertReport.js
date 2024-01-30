const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expertReportSchema = new mongoose.Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  psychometricId:{
    type: Schema.Types.ObjectId, 
    ref: 'Expert', 
    required: true
  },
  overallFeedback:{type: String},
  advice:{type: String},
  expertReports: [
    {
      question: { type: String },
      answer: { type: String },
      feedback: { type: String }
    }
  ]
}, { timestamps: true });

const ExpertReport = mongoose.model('ExpertReport', expertReportSchema);

module.exports = ExpertReport;
