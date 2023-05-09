const {Department} = require('../models/department');
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

router.get(`/`, async (req, res) =>{
    const departmentList = await Department.find().sort({ name: 1 }).populate();

    if(!departmentList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(departmentList);
})

router.get('/:id', async(req,res)=>{
    const department = await Department.findById(req.params.id).sort({ name: 1 });

    if(!department) {
        res.status(500).json({message: 'The department with the given ID was not found.'})
    } 
    res.status(200).send(department);
})



router.post('/add-department', async (req,res)=>{
    console.log(">",req.body)
    let department = new Department({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    department = await department.save();

    if(!department)
    return res.status(400).send('the department cannot be created!')

    res.send(department);
})

router.put('/:id',async (req, res)=> {
    const department = await Department.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            // icon: req.body.icon || department.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!department)
    return res.status(400).send('the department cannot be created!')

    res.send(department);
})




router.delete('/:id', (req, res)=>{
    Department.findByIdAndRemove(req.params.id).then(department =>{
        if(department) {
            return res.status(200).json({success: true, message: 'the department is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "department not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;