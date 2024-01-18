const mongoose = require('mongoose');
var bcrypt = require('bcrypt');

const expertSchema = new mongoose.Schema({
    name: {
        type: String,
        // required:true
    },
    email: {
        type: String,
        // unique: true,
        // required:true
    },
    passwordHash: {
        type: String,
    },
    phone:{
        type:Number,
        // required:true
    },
    profileimage: {
        type: String,
        default:[]
   
    },
    address: {
        type: String,

    },
    city:{
        type: String,
  
    },
    state:{
        type:String,
        
    },
    pinCode: {
        type:String,
        // default: false,
    },
    country:{
        type:String
    },
    nationality:{
        type:String
    },
    martial:{

        type:String
    },
    educations:{
        type :Array,
        default:[]
    },

    professions:{
        type:Array,
        default:[]
    },

    achivements:{
        type:Array,
        default:[]
    },

    role: {
        type: String
    },

    resume:{
        type:String
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now // Set default value to current date and time
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },

    otp: String,
    loginAttempts: { type: Number, default: 0 },
    lastFailedLoginAttempt: { type: Date, default: null },
}, { timestamps: true });

// expertSchema.statics.hashPassword = function hashPassword(passwordHash) {
//     return bcrypt.hashSync(passwordHash, 10);
// }

expertSchema.statics.hashPassword = function hashPassword(passwordHash) {
    return bcrypt.hashSync(passwordHash, 10);
}


expertSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

expertSchema.set('toJSON', {
    virtuals: true,
});


exports.Expert = mongoose.model('Expert', expertSchema);
exports.expertSchema = expertSchema;
