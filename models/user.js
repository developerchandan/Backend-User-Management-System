const mongoose = require('mongoose');

var bcrypt = require('bcrypt');
const { boolean } = require('joi');
const userSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    email: {
        type: String,
        unique: true
    },
    passwordHash: {
        type: String,

    },
    role: {
        type: String
    },
    phone: {
        type: String,

    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    userId:{
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now // Set default value to current date and time
    },
    loginAttempts: { type: Number, default: 0 },
    lastFailedLoginAttempt: { type: Date, default: null },
}, { timestamp: true });

userSchema.statics.hashPassword = function hashPassword(passwordHash) {
    return bcrypt.hashSync(passwordHash, 10);
}

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});


exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
