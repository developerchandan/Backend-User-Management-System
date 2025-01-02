const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id:{
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['Admin','Editor', 'Viewer'],
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  
},
{
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
