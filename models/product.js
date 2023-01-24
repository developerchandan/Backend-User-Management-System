const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    
    jobProfile: {
        type: String,
       
    },
    companyName: {
        type: String,
       
    },
    role:{
        type: String,
    },
    url:{
        type: String,
    },

    workingTime:{
        type: String,
    },

    country:{
        type: String,
    },
    state:{ type: String,},
    city:{ type: String,},
    hrNumber:{
        type: String,
    },
    location: {
        type: String,
       
    },
    salary: {
        type: String,
       
    },
    experience: {
        type: String,
       
    },
    education: {
        type: String,
       
    },
    skills: {
        type: String,
       
    },
    aboutCompany: {
        type: String,
       
    },
    companyAddress: {
        type: String,
       
    },





    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    brand: {
        type: String,
        default: ''
    },
    price : {
        type: Number,
        default:0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});


exports.Product = mongoose.model('Product', productSchema);
