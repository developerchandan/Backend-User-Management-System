const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
   
  },
  video: {
    type: String,
   
  },
});

const pdfSchema = new mongoose.Schema({
  title: {
    type: String,
   
  },
  pdf: {
    type: String,
   
  },
});

const mcqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  questions: [
    {
      questionText: {
        type: String,
        required: true
      },
      options: [
        {
          optionText: {
            type: String,
            required: true
          },
          answer: {
            type: Boolean, // Update the answer field to be Boolean type
            required: true
          }
        }
      ]
    }
  ]
});



const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
   
  },
  videos: [videoSchema],
  pdfs: [pdfSchema],
  mcqs:[mcqSchema],
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
   
  },
  lessons: [lessonSchema],
  
});

const courseSchema = new mongoose.Schema({
  uniqutitle:{
    type :String,
  },
  image:{
    type :String,
  },
  title: {
    type: String,
   
  },
  instructor: {
    type: String,
   
  },
  description: {
    type: String,
   
  },
  richdescription:{
    type: String,
  },
  duration: {
    type: String,
   
  },
  curriculum: [sectionSchema],
  rating: {
    type: Number,
    default: 0,
  },
  studentsEnrolled: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  url: {
    type: String,
   
  },
  price: {
    type: Number,
   
  },
  language: {
    type: String,
   
  },
  category: {
    type: String,
   
  },
  skillLevel: {
    type: String,
   
  },
  badges: {
    type: [String],
  },
  reviews: [
    {
      username: {
        type: String,
       
      },
      rating: {
        type: Number,
       
      },
      comment: {
        type: String,
      },
    },
  ],
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isTopRated: {
    type: Boolean,
    default: false,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    expires: {
      type: Date,
    },
  },
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
