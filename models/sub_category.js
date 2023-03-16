const mongoose = require('mongoose');

const sub_categorySchema = mongoose.Schema({
    
    category_id: {
        type:'ObjectId',
        ref: 'Category',

    },

    sub_category_id: {
        type: String,
        
    },
    icon: {
        type: String,
    },
    color: { 
        type: String,
    }



    
})


sub_categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

sub_categorySchema.set('toJSON', {
    virtuals: true,
});

exports.SubCategory = mongoose.model('SubCategory', sub_categorySchema);




