const { string } = require('joi');
const mongoose = require('mongoose');

const humanResource = mongoose.Schema({
    name: {
        type: String
    },

    email: {
        type: String
    },
    image: {
        type: String,
        default: ''
    },
    images: [
        {
            type: String
        }
    ],

    category: {
        type: [String],
        default: [],  
    },
    subCategory: {
        type: [String],
        default: [],  
      
    },

    description: { type: String },
    richdescription: { type: String },

    type: {
        type: String
    },
    status: {
        type: String
    },
    uploadName: {
        type: String
    },
    upload: {
        type: Boolean,
        default: true
    },
    owner: {
        type: String
    },
    owneremail: {
        type: String
    },

    subCompetency: [
        {
            subcompatency_name: String,
            strength_id:String,
            subCompatencyAnalysis:[
                {
                    analysis_name:String,
                    analysis_range:String,
                }
            ],
            subBeahviourList: [
                {
                    beahviourName: String,
                    subcompatency_id:String,

                    Question: [
                        {
                            propertyid: {
                                type: String,
                                required: true
                            },
                            competencyId:String,
                            subcompetencyid: {
                                type: String,
                                required: true
                            },
                            behaviourId:{
                                type: String,
                                required: true
                            },
                            
                            questionId: {
                                type: String,
                                required: true
                            },
                            questionText:{
                                type: String, 
                                required: true
                            },
                            answer: {
                                type: String,
                                required: true
                            },
                            options:[{
                                scale:String,
                                value:String,
                                analysis:String,
                                comments:[]
                            }]
                        }
                    ],
                 
                }
            ],
          
        },
        
    ],

    summary:[
        {
            title:String,
            description:String,
            range:String,
            default:'',
        }
    ],
    isFeatured: {
        type: Boolean,
        default: false
    },

    isHomeFeatured:{
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

humanResource.virtual('id').get(function () {
    return this._id.toHexString();
});

humanResource.set('toJSON', {
    virtuals: true
});

exports.HumanR = mongoose.model('HumanR', humanResource);
