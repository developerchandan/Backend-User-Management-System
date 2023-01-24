const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { HumanR } = require('../models/humanresource');
const multer = require('multer');
const { Category } = require('../models/category');
const AWS = require('aws-sdk');
const { Question } = require('../models/question');
const { User } = require('../models/user');
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();





AWS.config.update({
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});


var s3 = new AWS.S3();


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const upload = multer();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });






router.post('/addstrengthvalue', upload.single('file'), async (req, res) => {

    console.log(req.body);
    console.log("file", req.file);
    console.log(req.file.originalname, req.file.buffer)

    let params = {
        Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
        Key: req.file.originalname,
        Body: req.file.buffer,
    };

    s3.upload(params, (err, result) => {

        if (err) {
            res.status(500).json({
                message: "Failed to upload file",
                error: err.message,
            });
        }
        else {
            console.log("response", result)
            res.send(result);
        }

    })

})

// router.get('/:id', async (req, res) => {
//     const user = await User.findOne(req.params.id);

//     if (!user) {
//         res.status(500).json({ message: 'The user with the given ID was not found.' })
//     }
//     res.status(200).send(user);
// })



router.post('/addstrengthvalues', upload.single('image'), async (req, res) => {

    let params = {
        Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
        Key: req.file.originalname,
        Body: req.file.buffer,
    };

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');


    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    console.log(fileName);
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;


    whoid = req.userId;
    whoemail = req.email
    console.log("", req.whoid);

    let humanResource = new HumanR({

        name: req.body.name,

        behaviouralAbility: req.body.behaviouralAbility,
        behaviouralAbilityDescription: req.body.behaviouralAbilityDescription,
        snapshotAboutStrength: req.body.snapshotAboutStrength,
        snapshotAboutStrengthDescription: req.body.snapshotAboutStrengthDescription,
        objective: req.body.objective,
        objectiveDescription: req.body.objectiveDescription,
        testProcess: req.body.testProcess,
        testProcessDescription: req.body.testProcessDescription,
        outcome: req.body.outcome,
        outcomeDescription: req.body.outcomeDescription,
        targetAudience: req.body.targetAudience,
        targetAudienceDescription: req.body.targetAudienceDescription,
        benefitsToIndividuals: req.body.benefitsToIndividuals,
        benefitsToIndividualsDescription: req.body.benefitsToIndividualsDescription,
        approach: req.body.approach,
        approachsDescription: req.body.approachsDescription,
        relevantTraining: req.body.relevantTraining,
        relevantTrainingDescription: req.body.relevantTrainingDescription,
        relevantTrainingAndDevelopment: req.body.relevantTrainingAndDevelopment,
        relevantTrainingAndDevelopmentDescription: req.body.relevantTrainingAndDevelopmentDescription,
        meettheExpert: req.body.meettheExpert,
        meettheExperttDescription: req.body.meettheExperttDescription,


        description: req.body.description,
        // image: `${basePath}${fileName}`,
        email: req.body.email,
        category: req.body.category,
        richdescription: req.body.richdescription,
        owner: whoid,
        owneremail: whoemail
    })
    humanResource = await humanResource.save();

    if (!humanResource)
        return res.status(400).send('the humanResource cannot be created!')

    // res.send(humanResource);

    s3.upload(params, (err, result) => {

        if (err) {
            console.log('upload failed')
            res.status(500).json({
                message: "Failed to upload file",
                error: err.message,
            });
        }
        else {

            // console.log("response", result)
            // console.log("response", result.Location)           
            // console.log(humanResource);
            HumanR.findByIdAndUpdate({ _id: humanResource._id }, {
                $set: {
                    image: result.Location
                }
            }).then((data) => {

                console.log(data);
                res.json({ data });

            }).catch((e) => {
                res.send(e)
            })
        }

    })

})

router.post('/getlistdata', async (req, res) => {
    // console.log("Hi", req.params.key);
    console.log(req.body)
    // console.log(req.body.role)
    HumanR.find({ email: req.body.email }).populate('category').then((result) => {
        res.send({ data: result, status: 'success' })
    }).catch((e) => {
        res.send(e);
    })
});




router.get('/:id', async (req, res) => {
    const human = await HumanR.findById(req.params.id).populate('category');

    if (!human) {
        res.status(500).json({ message: 'The human with the given ID was not found.' })
    }
    res.status(200).send(human);
})


router.get('/quiz/all', async (req, res) => {
    const human = await HumanR.find({}).sort({ name: 1 }).populate('category');

    if (!human) {
        res.status(500).json({ message: 'The human with the given ID was not found.' })
    }
    res.status(200).send(human);
})


// router.put('/:id',async (req, res)=> {

//     HumanR.findOneAndUpdate({_id:req.params.id},{

//         $set:{
//             quizname: req.body.quizname,
//             strength: req.body.strength,
//             quizdescription: req.body.quizdescription,

//         }

//     })
//     // if (!human) {
//     //     res.status(500).json({ success: false });
//     // }

//     // console.log(human)
//     // res.send(human);
// })

router.put('/:id', async (req, res) => {
    const humanResource = await HumanR.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.quizname,
            description: req.body.quizdescription,
            image: result.Location,
            category: req.body.category,
            richdescription: req.body.richdescription
        },
        { new: true }
    )

    if (!humanResource)
        return res.status(400).send('the humanResource cannot be created!')

    res.send(humanResource);
})

router.delete('/:id', (req, res) => {
    HumanR.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the HumanR is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "HumanR not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

//Add Question Section

router.post('/addquestion', async (req, res) => {

    HumanR.find({ quizid: req.body.quizid }, (err, q) => {
        if (err) {
            console.log(error);
            res.json({ msg: "some error!" });
        }
        else {
            var question = new Question({
                quizid: req.body.quizid,
                questionId: q.length + 1,
                questionText: req.body.questionText,
                answer: req.body.answer,
                options: req.body.options
            });

            question.save((error, qsn) => {
                if (error) {
                    console.log(error);
                    res.json({ msg: "some error!" });
                }
                else {
                    res.status(200).json({ message: "yes question added!!" })
                }
            })
        }
    })
});


router.get('/getuploadquiz', async (req, res) => {

    HumanR.find({ owner: req.userId, upload: false }, (err, qz) => {
        if (err) {
            console.log(error);
            res.json({ msg: "some error!" });
        }
        else {
            res.json({ quiz: qz });
        }
    })

}

)
router.post('/uploadquiz', async (req, res) => {


    console.log("upload back");
    console.log(req.body);
    Question.find({ quizid: req.body.id }, (err, qz) => {
        if (err) {
            console.log(error);
            res.json({ msg: "some error!" });
        }
        else {
            console.log(qz.length);
            if (qz.length < 0) {
                res.json({ msg: "You must have 1 question in the quiz for upload quiz!!" });
            }
            else {
                HumanR.updateOne({ _id: req.body.id }, { upload: true }, function (err, user) {
                    if (err) {
                        console.log(err)
                        res.json({ msg: "something went wrong!!" })
                    }
                    else {
                       
                        res.json({ message: "quiz uploaded!" });
                    }
                })

            }

        }
    })
})





// router.put('/:id', async (req, res) => {
//     const contact = await Contact.findByIdAndUpdate(
//         req.params.id,
//         {
//             name: req.body.name,
//             email: req.body.email,
//             mobile: req.body.mobile,
//             message: req.body.message
//         },
//         { new: true }
//     );

//     if (!contact) return res.status(400).send('the contact cannot be created!');

//     res.send(contact);
// });

router.delete('/:id', (req, res) => {
    var id = req.params.id
    // console.log(req.params.id);
    Quiz.deleteOne({ _id: id }, (err) => {
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
    const io = req.app.get('io');
    io.emit("quizcrud", "Quiz Curd done here");
    res.status(200).json({ msg: "yes deleted user by admin" })
});


exports.verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send("unauthorized req")
    }
    let token = req.headers.authorization.split(' ')[1]
    // console.log(token);  
    if (token == 'null') {
        return res.status(401).send("unauthorized req")
    }
    let payload = jwt.verify(token, 'secret')
    if (!payload) {
        return res.status(401).send("unauthorized req")
    }
    // console.log("in middleware");
    // console.log(payload.subject);
    // console.log(payload.email);
    req.userId = payload.subject
    req.email = payload.email;
    // console.log(req.userId);
    // console.log(req.email);
    next()
}


module.exports = router;