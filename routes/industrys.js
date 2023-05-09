const {Industries} = require('../models/industry');
const express = require('express');
const { Result } = require('../models/result');
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

router.get(`/`, async (req, res) =>{
    const industriesList = await Industries.find().sort({ name: 1 }).populate();

    if(!industriesList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(industriesList);
})

router.get('/:id', async(req,res)=>{
    const industries = await Industries.findById(req.params.id).sort({ name: 1 });

    if(!industries) {
        res.status(500).json({message: 'The industries with the given ID was not found.'})
    } 
    res.status(200).send(industries);
})



router.post('/add-industry', async (req,res)=>{
    console.log(">",req.body)
    let industries = new Industries({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    industries = await industries.save();

    if(!industries)
    return res.status(400).send('the industries cannot be created!')

    res.send(industries);
})

router.put('/:id',async (req, res)=> {
    const industries = await Industries.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            // icon: req.body.icon || industries.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!industries)
    return res.status(400).send('the industries cannot be created!')

    res.send(industries);
})




router.delete('/:id', (req, res)=>{
    Industries.findByIdAndRemove(req.params.id).then(industries =>{
        if(industries) {
            return res.status(200).json({success: true, message: 'the industries is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "industries not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;