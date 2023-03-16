const mongoose =require('mongoose');

 const testTypeSchema=new mongoose.Schema({

    name: String,
    icon: String,
    color:String,
    date: { type: Date, default: Date.now }

})

exports.TestType = mongoose.model("TestType", testTypeSchema);
