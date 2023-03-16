const express = require('express');
const router = express.Router();
const { TestType } = require('../models/testtype');



router.get('/',(req,res)=>{

    TestType.find({}, (error, result) => {
        if (error) return res.status(500).send(error);
        res.send(result);
      });
    
})


router.post("/addtest", async (req, res) => {
    const testType = new TestType({
      name: req.body.name,
      icon: req.body.icon,
      color:req.body.color,
    });
    testType.save((error, result) => {
      if (error) return res.status(500).send(error);
      res.send(result);
    });
  });


  router.delete('/:id', (req, res)=>{
    TestType.findByIdAndRemove(req.params.id).then(testType =>{
        if(testType) {
            return res.status(200).json({success: true, message: 'the Test Type deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Test Type not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})








  module.exports =router;