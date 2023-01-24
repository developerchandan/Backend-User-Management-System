const {Coursecategory} = require('../models/course_category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const courseCategoryList = await Coursecategory.find();

    if(!courseCategoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(courseCategoryList);
})

router.get('/:id', async(req,res)=>{
    const coursecategory = await Coursecategory.findById(req.params.id);

    if(!coursecategory) {
        res.status(500).json({message: 'The course category with the given ID was not found.'})
    } 
    res.status(200).send(coursecategory);
})



router.post('/', async (req,res)=>{
    let coursecategory = new Coursecategory({
        name: req.body.name,
        icon: req.body.icon,
        duration:req.body.duration,
        mode: req.body.mode,
        color: req.body.color
    })
    coursecategory = await coursecategory.save();

    if(!coursecategory)
    return res.status(400).send('the course category cannot be created!')

    res.send(coursecategory);
})


router.put('/:id',async (req, res)=> {
    const coursecategory = await Coursecategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || coursecategory.icon,
            duration:req.body.duration,
            mode:req.body.mode,
            color: req.body.color,
        },
        { new: true}
    )

    if(!coursecategory)
    return res.status(400).send('the coursecategory cannot be created!')

    res.send(coursecategory);
})

router.delete('/:id', (req, res)=>{
    Coursecategory.findByIdAndRemove(req.params.id).then(coursecategory =>{
        if(coursecategory) {
            return res.status(200).json({success: true, message: 'the course category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "course category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;