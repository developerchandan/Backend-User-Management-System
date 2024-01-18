const express = require('express');
const router = express.Router();
const RequestDemo = require('../models/demo');

router.post("/request-demo", async (req, res) => {
    try {

        const existingRequest = await RequestDemo.findOne({email:req.body.email});

        if(existingRequest){
            return res.status(400).json({error: "Email Alreday exists!"});
        }

        const requestDemo = new RequestDemo({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role,
            company: req.body.company,
        });

        const saveData = await requestDemo.save();
        return res.status(200).json("Request Demo Register Successful");
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/all-request", async(req, res) => {
    try{
        const getRequestData = await RequestDemo.find();

        if ( ! getRequestData ){
            return res.status(400).json("Request Demo is not found Data");
        }
        return res.status(200).json(getRequestData);
    }
    catch(error){
        return res.status(500).json({success:false, error: error.message});
    }
});

router.delete("/request-demo/:id", async(req, res) => {
    try{

        const requestId= req.params.id;

        const deleteRequest = await RequestDemo.findByIdAndDelete(requestId);

        if( !deleteRequest){
            return res.status(404).json("Request Demeo is not found!")
        }

        return res.status(200).json("Request Demo is Deleted!");

    }
    catch(error){
        return res.status(500).json({success:false, error: error.message});
    }
})

module.exports = router;
