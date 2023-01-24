const {stateCategory} = require('../models/stateCat');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const stateCategoryList = await stateCategory.find();

    if(!stateCategoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(stateCategoryList);
})

router.get('/:id', async(req,res)=>{
    const statecategory = await stateCategory.findById(req.params.id);

    if(!statecategory) {
        res.status(500).json({message: 'The state category with the given ID was not found.'})
    } 
    res.status(200).send(statecategory);
})



router.post('/', async (req,res)=>{
    let statecategory = new stateCategory({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    statecategory = await statecategory.save();

    if(!statecategory)
    return res.status(400).send('the state category cannot be created!')

    res.send(statecategory);
})


router.put('/:id',async (req, res)=> {
    const statecategory = await stateCategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || statecategory.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!statecategory)
    return res.status(400).send('the state category cannot be created!')

    res.send(statecategory);
})

router.delete('/:id', (req, res)=>{
    stateCategory.findByIdAndRemove(req.params.id).then(statecategory =>{
        if(statecategory) {
            return res.status(200).json({success: true, message: 'the state category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "state category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;