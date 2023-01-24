const mongoose = require('mongoose');

const humanResource = mongoose.Schema({

    name: {
        type: String,

    },

    email: {
        type: String,
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',

    },
    description: { type: String, },
    richdescription: { type: String },
    behaviouralAbility: { type: String },
    behaviouralAbilityDescription: { type: String },
    snapshotAboutStrength: {
        type: String,
    },
    snapshotAboutStrengthDescription: { type: String },
    objective: { type: String },
    objectiveDescription: { type: String },

    testProcess: { type: String },

    testProcessDescription: { type: String },
    outcome: { type: String, },
    outcomeDescription: { type: String },
    targetAudience: {
        type: String,
    },

    targetAudienceDescription: {
        type: String,

    },

    benefitsToIndividuals: {
        type: String,
    },

    benefitsToIndividualsDescription: {
        type: String,

    },

    approach: {
        type: String,
    },
    approachsDescription: {
        type: String,

    },
    relevantTraining: {
        type: String,
    },
    relevantTrainingDescription: {
        type: String,

    },


    relevantTrainingAndDevelopment: {
        type: String,
    },

    relevantTrainingAndDevelopmentDescription: {
        type: String,

    },

    meettheExpert: {
        type: String,
    },

    meettheExperttDescription: {
        type: String,
    },
    status: {
        type: String,

    },
    uploadName: {
        type: String,

    },
    upload: {
        type: Boolean, default: false
    },
    owner: {
        type: String,
    },
    owneremail: {
        type: String,
    },

    dateCreated: {
        type: Date,
        default: Date.now,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },


})

humanResource.virtual('id').get(function () {
    return this._id.toHexString();
})

humanResource.set('toJSON', {
    virtuals: true,
});


exports.HumanR = mongoose.model('HumanR', humanResource);