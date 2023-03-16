const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,

    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    }
    , subCategory: [
        {
            subCategoryName: String,
            subCategoryIcon: String,
            subCategoryIcon: String,
            

            subCategoryList: [{
                strength_id:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'HumanR',
                },
                
              
            }]
        }
    ],




})


categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

exports.Category = mongoose.model('Category', categorySchema);
