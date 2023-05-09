const express = require('express');
const router = express.Router();
const { QuizList } = require('../models/quiz');
const multer = require('multer');
const { Quiz_Category } = require('../models/quiz-category');
const AWS = require('aws-sdk');
const { Question } = require('../models/question');
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');


const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(openaiConfig);

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

router.get(`/quiz/all`, async (req, res) => {
    console.log(req.body);
    const quizLists = await QuizList.find().sort({ name: 1 }).populate('quiz_category');

    if (!quizLists) {
        res.status(500).json({ success: false });
    }
    res.send(quizLists);
});

router.get('/:id', async (req, res) => {
    const quiz = await QuizList.findById(req.params.id)
        .populate('quiz_category');

    if (!quiz) {
        res.status(500).json({ message: 'The Quiz with the given ID was not found.' })
    }
    res.status(200).send(quiz);
})

//@ Add items..

router.post('/add-quiz', upload.single('image'), async (req, res) => {
    console.log("Quiz", req.body);
    let params = {
        Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
        Key: req.file.originalname,
        Body: req.file.buffer,
    };

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    console.log(fileName);
    whoid = req.userId;
    whoemail = req.email
    console.log("", req.whoid);

    let quizResource = new QuizList({

        name: req.body.name,
        description: req.body.description,
        quiz_category:req.body.quiz_category,
        email: req.body.email,
        richdescription: req.body.richdescription,
        isFeatured: req.body.isFeatured,
        isHomeFeatured: req.body.isHomeFeatured,
        owner: whoid,
        owneremail: whoemail
    })
    quizResource = await quizResource.save();

    if (!quizResource)
        return res.status(400).send('the Quiz cannot be created!')

    s3.upload(params, (err, result) => {

        if (err) {
            console.log('upload failed')
            res.status(500).json({
                message: "Failed to upload file",
                error: err.message,
            });
        }
        else {
            QuizList.findByIdAndUpdate({ _id: quizResource._id }, {
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
    QuizList.find({ email: req.body.email }).populate('quiz_category').then((result) => {
        res.send({ data: result, status: 'success' })
    }).catch((e) => {
        res.send(e);
    })
});

router.put('/:id', upload.single('image'), async (req, res) => {
    let updatedQuiz = {};

    if (req.file) {
        const s3 = new AWS.S3({

            secretAccessKey: process.env.AWS_ACCESS_SECRET,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            region: process.env.AWS_REGION
        });


        const params = {
            Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
            Key: `${Date.now()}_${req.file.originalname}`,
            Body: req.file.buffer
        };

        try {
            const data = await s3.upload(params).promise();
            updatedQuiz.image = data.Location;
        } catch (err) {
            console.log(err);
            return res.status(500).send('Error uploading image to S3');
        }
    }

    updatedQuiz.name = req.body.name;
    updatedQuiz.quiz_category = req.body.quiz_category;
    updatedQuiz.description = req.body.description;
    updatedQuiz.email = req.body.email;
    updatedQuiz.isFeatured = req.body.isFeatured;
    updatedQuiz.isHomeFeatured = req.body.isHomeFeatured;
    updatedQuiz.richdescription = req.body.richdescription;

    try {
        const quiz = await QuizList.findByIdAndUpdate(req.params.id, updatedQuiz, { new: true });
        res.send(quiz);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating quiz');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const quiz = await QuizList.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'QuizList not found' });
        }

        if (quiz.image) {
            const s3 = new AWS.S3({
                secretAccessKey: process.env.AWS_ACCESS_SECRET,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                region: process.env.AWS_REGION
            });

            const key = quiz.image.split('/').pop(); // extract the key from the URL

            const params = {
                Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
                Key: key,
            };

            await s3.deleteObject(params).promise();
        }

        await QuizList.findByIdAndRemove(req.params.id);
        return res.status(200).json({ success: true, message: 'Quiz deleted' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, error: err });
    }
});

//Add Question Section

router.post('/addquestion', async (req, res) => {
    // Get the count of all questions in the Question model
    const questionCount = await Question.countDocuments();
  
    const question = new Question({
      quizid: req.body.quizid,
      questionId: questionCount + 1, // Set the questionId as the count plus 1
      questionText: req.body.questionText,
      answer: req.body.answer,
      options: req.body.options,
    });
  
    question.save((error, qsn) => {
      if (error) {
        console.log(error);
        res.json({ msg: "some error!" });
      } else {
        res.status(200).json({ message: "yes question added!!" })
      }
    })
  });
  


router.get('/getuploadquiz', async (req, res) => {

    QuizList.find({ owner: req.userId, upload: false }, (err, qz) => {
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

// active UploadQuiz data !
router.post('/uploadquiz', async (req, res) => {
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
                QuizList.updateOne({ _id: req.body.id }, { upload: true }, function (err, user) {
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

//Psychometric Upload True Get API !
router.get(`/get/count`, async (req, res) => {
    const QuizCount = await QuizList.countDocuments((count) => count);

    if (!QuizCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        QuizCount: QuizCount
    });
});

router.get(`/get/home/count`, async (req, res) => {
    const quizCount = await QuizList.countDocuments((count) => count);

    if (!quizCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        quizCount: quizCount
    });
});

router.get(`/get/counts`, async (req, res) => {
    const quizCategoryCount = await Quiz_Category.countDocuments((count) => count);

    if (!quizCategoryCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        quizCategoryCount: quizCategoryCount
    });
});


router.get(`/get/homefeatured/:count`, async (req, res) => {

    const count = req.params.count ? req.params.count : 0;
    const quizs = await QuizList.find({ isHomeFeatured: true }).limit(+count);

    if (!quizs) {
        res.status(500).json({ success: false });
    }
    res.send(quizs);
});

router.get(`/get/featured/:count`, async (req, res) => {

    const count = req.params.count ? req.params.count : 0;
    const quizs = await QuizList.find({ isFeatured: true }).limit(+count);

    if (!quizs) {
        res.status(500).json({ success: false });
    }
    res.send(quizs);
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
    req.userId = payload.subject
    req.email = payload.email;
    next()
}


module.exports = router;