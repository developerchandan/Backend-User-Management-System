// models/assignment.js
const { boolean } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const assignmentSchema = new Schema({
  assessmentId: { type: Schema.Types.ObjectId, ref: 'UnMask', required: true },
  expertId: { type: Schema.Types.ObjectId, ref: 'Expert', required: true },
  isAssigned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const AssignmentTest = mongoose.model('AssignmentTest', assignmentSchema);

module.exports = AssignmentTest;
