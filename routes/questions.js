const { Question } = require('../models/question');
const { QuizList } = require('../models/quiz');
const express = require('express');
const router = express.Router();

router.get(`/:id`, async (req, res) => {
    Question.find({ quizid: req.params.id }, (err, qz) => {
        if (err) {
            console.log(error);
            res.json({ errormsg: "some error!" });
        }
        else {
            res.json({ msg: qz });
        }
    })
});



router.get('/getallquiz', async (req, res)=>{

    QuizList.find({upload:true}, (err, qz) => {
        if (err) {
            console.log(error);
            res.json({ msg: "some error!" });
        }
        else {
            res.json({ quiz: qz });
        }
    })
})


router.get('/getallquestion/:id', async (req,res)=>{
    Question.find({ "quizid": req.params.id }, (err, qz) => {
        if (err) {
            console.log(error);
            res.json({ errormsg: "some error!" });
        }
        else {
            res.json({ msg: qz });
        }
    })
})


router.get('/getGetValueById', async (req,res)=>{
    QuizList.find({ _id: req.params.id }, (err, qz) => {
        if (err) {
            console.log(error);
            res.json({ errormsg: "some error!" });
        }
        else {
            res.json({ msg: qz });
        }
    })
})

router.delete('/:id', (req, res) => {
    var id = req.params.id
    // console.log(req.params.id);
    QuizList.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: "Somthing went wrong!!" });
            console.log("err in delete by admin");
        }
    })
    Question.deleteMany({ quizid: id }, (err) => {
        if (err) {
            res.json({ msg: "Somthing went wrong!!" });
            console.log("err in delete by admin");
        }
    })

    res.status(200).json({ msg: "yes deleted user by admin" })
});

module.exports = router;
