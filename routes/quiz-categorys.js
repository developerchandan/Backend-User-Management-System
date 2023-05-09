const {Quiz_Category} = require('../models/quiz-category');
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

router.get(`/`, async (req, res) =>{
    const quizCategoryList = await Quiz_Category.find().sort({ name: 1 }).populate();

    if(!quizCategoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(quizCategoryList);
})

router.get('/:id', async(req,res)=>{
    const quiz_Category = await Quiz_Category.findById(req.params.id).sort({ name: 1 });

    if(!quiz_Category) {
        res.status(500).json({message: 'The quiz_Category with the given ID was not found.'})
    } 
    res.status(200).send(quiz_Category);
})



router.post('/add-quiz-category', async (req,res)=>{
    console.log(">",req.body)
    let quiz_Category = new Quiz_Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    quiz_Category = await quiz_Category.save();

    if(!quiz_Category)
    return res.status(400).send('the quiz_Category cannot be created!')

    res.send(quiz_Category);
})

router.put('/:id',async (req, res)=> {
    const quiz_Category = await Quiz_Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            // icon: req.body.icon || quiz_Category.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!quiz_Category)
    return res.status(400).send('the quiz_Category cannot be created!')

    res.send(quiz_Category);
})




router.delete('/:id', (req, res)=>{
    Quiz_Category.findByIdAndRemove(req.params.id).then(quiz_Category =>{
        if(quiz_Category) {
            return res.status(200).json({success: true, message: 'the quiz_Category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "quiz_Category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;