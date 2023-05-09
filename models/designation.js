const { types, string } = require('joi');
const mongoose = require('mongoose');

const designationSchema = mongoose.Schema({
    name: {
        type: String,

    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
    industry: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Industries'
        }
    ],
    department: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        }
    ],
    KRAs: [
        {
            KRAs_name: String,
            title:String,
        }

    ],
    KPIs: [{
        KPIs_name: String,
        Definitions: String,
        Formula: String,
        Calculation: String,
    }],

    SKB_Skill_InventoryBank: [{
        technical_Skills: String,
        functional_Skills: String,
        soft_Skills: String,
    }],

    roleAndResponsibility: [
        {

            title:String,
            responsibility: String

        }
    ],
    createdAt: {
        type: Date,
        default: Date.now // Set default value to current date and time
    }

})

designationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

designationSchema.set('toJSON', {
    virtuals: true,
});

exports.Designation = mongoose.model('Designation', designationSchema);
