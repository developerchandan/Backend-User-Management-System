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

// 

router.get(`/quiz/all`, async (req, res) => {
    console.log(req.body);
    // let filter = {};
    // if (req.query.categories) {
    //     filter = { category: req.query.categories.split(',') };
    // }
    // if (req.query.subCategories) {
    //     filter = { ...filter, subCate: req.query.subCategories.split(',') };
    // }

    const strengthList = await HumanR.find().sort({ name: 1 }).populate('category');

    if (!strengthList) {
        res.status(500).json({ success: false });
    }
    res.send(strengthList);
});

// router.get(`/quiz/all`, async (req, res) => {
//     let filter = {};
//     if (req.query.categories) {
//         filter = {
//             category: { $in: req.query.categories.split(',') },
//             'category.subCategory': { $in: req.query.subCategories.split(',') }
//         };
//     }

//     const strengthList = await HumanR.find(filter).sort({ name: 1 }).populate('category').populate('subCategory');

//     if (!strengthList) {
//         res.status(500).json({ success: false });
//     }
//     res.send(strengthList);
// });




router.get('/:id', async (req, res) => {
    const human = await HumanR.findById(req.params.id)
        .populate('category');

    if (!human) {
        res.status(500).json({ message: 'The human with the given ID was not found.' })
    }
    res.status(200).send(human);
})



// router.get('/quiz/all', async (req, res) => {
//     const human = await HumanR.find({}).sort({ name: 1 }).populate('category');

//     if (!human) {
//         res.status(500).json({ message: 'The human with the given ID was not found.' })
//     }
//     res.status(200).send(human);
// })


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


router.get(`/get/type/:type`, async (req, res) => {
    console.log(req.body)
    HumanR.find({ type: req.params.type }, (err, qz) => {
        if (err) {
            console.log(error);
            res.json({ errormsg: "some error!" });
        }
        else {
            res.json({ msg: qz });
        }
    })
});



//@ Add items..

router.post('/addstrengthvalues', upload.single('image'), async (req, res) => {
    console.log("category",req.body);

     //let catID = req.body.category.split(',');
    // let subCatID = req.body.subCategory.split(',');

    // console.log(subCatID.length);
    

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

    let humanResource = new HumanR({

        name: req.body.name,
        type:req.body.type,
        description: req.body.description,
        email: req.body.email,
        // category: req.body.category,
        // subCategory: req.body.subCategory,
        richdescription: req.body.richdescription,
        isFeatured: req.body.isFeatured,
        isHomeFeatured:req.body.isHomeFeatured,
        owner: whoid,
        owneremail: whoemail
    })
    humanResource = await humanResource.save();

    if (!humanResource)
        return res.status(400).send('the humanResource cannot be created!')

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




// router.put('/:id', upload.single('image'), async (req, res) => {
//     // console.log(req.body)
//     // let catID = req.body.category.split(',');
//     const updatedProduct = await HumanR.findByIdAndUpdate(
//         req.params.id,
//         {
//             name: req.body.name,
//             type:req.body.type,
//             description: req.body.description,
//             email: req.body.email,
//             // category: catID,
//             isFeatured: req.body.isFeatured,
//             isHomeFeatured:req.body.isHomeFeatured,
//             richdescription: req.body.richdescription,
//         },
//         { new: true }
//     );

//     if (!updatedProduct) return res.status(500).send('the Strength cannot be updated!');

//     res.send(updatedProduct);
// });
router.put('/:id', upload.single('image'), async (req, res) => {
  let updatedProduct = {};

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
      updatedProduct.image = data.Location;
    } catch (err) {
      console.log(err);
      return res.status(500).send('Error uploading image to S3');
    }
  }

  updatedProduct.name = req.body.name;
  updatedProduct.type = req.body.type;
  updatedProduct.description = req.body.description;
  updatedProduct.email = req.body.email;
  updatedProduct.isFeatured = req.body.isFeatured;
  updatedProduct.isHomeFeatured = req.body.isHomeFeatured;
  updatedProduct.richdescription = req.body.richdescription;

  try {
    const product = await HumanR.findByIdAndUpdate(req.params.id, updatedProduct, { new: true });
    res.send(product);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating product');
  }
});


//@ Delete items..

// router.delete('/:id', (req, res) => {
//     HumanR.findByIdAndRemove(req.params.id).then(category => {
//         if (category) {
//             return res.status(200).json({ success: true, message: 'the HumanR is deleted!' })
//         } else {
//             return res.status(404).json({ success: false, message: "HumanR not found!" })
//         }
//     }).catch(err => {
//         return res.status(500).json({ success: false, error: err })
//     })
// })

router.delete('/:id', async (req, res) => {
    try {
      const product = await HumanR.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'HumanR not found' });
      }
  
      if (product.image) {
        const s3 = new AWS.S3({
            secretAccessKey: process.env.AWS_ACCESS_SECRET,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            region: process.env.AWS_REGION
        });
  
        const key = product.image.split('/').pop(); // extract the key from the URL
  
        const params = {
            Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
            Key: key,
        };
  
        await s3.deleteObject(params).promise();
      }
  
      await HumanR.findByIdAndRemove(req.params.id);
      return res.status(200).json({ success: true, message: 'HumanR deleted' });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, error: err });
    }
  });
  
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

// active UploadQuiz data !
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


// add property subcompetency Items !
router.put('/subcompetency/:id', jsonParser, (req, res) => {
    console.log(req.body);
    HumanR.findOneAndUpdate({ _id: req.params.id }, {
        $push: {

            subCompetency: {
                subcompatency_name: req.body.subcompatency_name,
                strength_id:req.body.strength_id
                
            }

        }
    },
        {new: true}
    ).then((Result) => {
        res.send(Result);
    })
        .catch((error) => {
            res.send(error);
        })

})

//Delete Subcompetency Item !
router.delete('/deletesubcompetencyitem/:subCompetencyId', (req, res) => {
    HumanR.findOneAndUpdate(
        {subCompetency: {$elemMatch: {_id: req.params.subCompetencyId}}},
        {$pull: {subCompetency: {_id: req.params.subCompetencyId}}},
        {new: true}
    )
    .then((Result) => {
        res.send(Result);
    })
    .catch((error) => {
        res.send(error);
    });
});


// add property SubBehaviour Items !
// router.put('/behaviour/:id', jsonParser, (req, res) => {
//     console.log(req.body);
//     HumanR.findOneAndUpdate({"subCompetency._id": req.params.id }, {
//         $push: {

//             "subCompetency.$.subBeahviourList": {
//                 beahviourName: req.body.beahviourName,
              
//             }

//         }
//     },
//         {new: true}
//     ).then((Result) => {
//         res.send(Result);
//     })
//         .catch((error) => {
//             res.send(error);
//         })

// });
// add property subBehaviour Items !

router.put('/behaviour/:id', jsonParser, (req, res) => {
    console.log(req.body);
    HumanR.findOneAndUpdate({"subCompetency._id": req.params.id }, {
        $push: {

            "subCompetency.$.subBeahviourList": {
                beahviourName: req.body.beahviourName,
              
            }

        }
    },
        {new: true}
    ).then((Result) => {
        res.send(Result);
    })
        .catch((error) => {
            res.send(error);
        })

});

// Delete subBeahviourList Items !

router.delete('/deletebehaviouritem/:subBehaviourId', (req, res) => {
    HumanR.findOneAndUpdate(
        {"subCompetency.subBeahviourList._id": req.params.subBehaviourId}, 
        {$pull: {"subCompetency.$.subBeahviourList": {_id: req.params.subBehaviourId}}}, 
        {new: true})
        .then((Result) => {
            res.send(Result);
        })
        .catch((error) => {
            res.send(error);
        });
});




// add property Question 

router.put('/question_add/:id', jsonParser, (req, res) => {
    HumanR.findOne({"subCompetency._id": req.params.id}, {"subCompetency.$": 1}).then((humanr) => {
      let subcomp = humanr.subCompetency[0];
      let subBehaviours = subcomp.subBeahviourList;
      let behaviourId = req.body.subBehaviourId;
      let behaviour = subBehaviours.find((beh) => {
        return beh._id == behaviourId;
      });
  
      if (behaviour) {
        let questions = behaviour.Question;
        let q = questions.length + 1; // Define and initialize the 'q' variable
        let question = {
          "questionId": q,
          "propertyid": req.body.subBehaviourId,
          "competencyId": req.body.testID,
          "subcompetencyid": req.params.id,
          "questionText": req.body.questionText,
          "answer": req.body.answer,
          "options": req.body.options,
        };
  
        HumanR.findOneAndUpdate({"subCompetency._id": req.params.id,"subCompetency.subBeahviourList._id": req.body.subBehaviourId}, {
          $push: {
            "subCompetency.$.subBeahviourList.$[i].Question": question
          }
        }, {
          arrayFilters: [{
            "i._id": req.body.subBehaviourId
          }]
        }).then((Result) => {
          res.send(Result);
        }).catch((error) => {
          res.send(error);
        })
      } else {
        res.send("Sub Behaviour not found");
      }
    }).catch((error) => {
      res.send(error);
    })
  });
  
// add property Question Summary !

router.put('/summary_add/:id', jsonParser, (req, res) => {
    console.log(req.body);
    HumanR.findOne({"subCompetency._id": req.params.id}, {"subCompetency.$": 1}).then((humanr) => {
      let subcomp = humanr.subCompetency[0];
      let subBehaviours = subcomp.subBeahviourList;
      let behaviourId = req.body.subBehaviourId;
      let behaviour = subBehaviours.find((beh) => {
        return beh._id == behaviourId;
      });
  
      if (behaviour) {
       
        let summary = {
          "title": req.body.title,
          "description": req.body.description,
          "range":req.body.range,
        };
  
        HumanR.findOneAndUpdate({"subCompetency._id": req.params.id,"subCompetency.subBeahviourList._id": req.body.subBehaviourId}, {
          $push: {
            "subCompetency.$.subBeahviourList.$[i].summary": summary
          }
        }, {
          arrayFilters: [{
            "i._id": req.body.subBehaviourId
          }]
        }).then((Result) => {
          res.send(Result);
        }).catch((error) => {
          res.send(error);
        })
      } else {
        res.send("Sub Behaviour not found");
      }
    }).catch((error) => {
      res.send(error);
    })
  });
  
// router.put('/question_add/:id', jsonParser, (req, res) => {
//     console.log(req.body);
//     console.log(req.body.testID);
//     HumanR.findOneAndUpdate({"subCompetency._id": req.params.id, "subCompetency.subBeahviourList._id": req.body.subBehaviourId }, {
//         $push: {

//             "subCompetency.$.subBeahviourList.$[i].Question": {
//                 "questionId": q.length + 1,
//                 "propertyid": req.body.subBehaviourId,
//                 "competencyId":req.body.testID,
//                 "subcompetencyid":req.params.id,
//                 "questionText":req.body.questionText,
//                 "answer":req.body.answer,
//                 "options":req.body.options, 
//             }
//         }
//     },
//     {
//         arrayFilters: [
//             {
//                 "i._id": req.body.subBehaviourId
//             }
//         ]
//     },
        
//     ).then((Result) => {
//         res.send(Result);
//     })
//         .catch((error) => {
//             res.send(error);
//         })

// });
router.get('/questions/:subcompetencyid', (req, res) => {
    let subcompetencyid = req.params.subcompetencyid;
  
    HumanR.findOne({"subCompetency._id": subcompetencyid}, {"subCompetency.$": 1}).then((humanr) => {
      let subcomp = humanr.subCompetency[0];
      let subcompName = subcomp.name;
      let subBehaviours = subcomp.subBeahviourList;
  
      // Create an empty array to hold the questions
      let questionsArr = [];
  
      // Iterate over the subBehaviours and their questions
      subBehaviours.forEach((behaviour) => {
        let questions = behaviour.Question;
  
        // Iterate over the questions and add them to the questionsArr array
        questions.forEach((question) => {
          questionsArr.push(question);
        });
      });
  
      // Create an object to hold the subcompetency name and questions array
      let result = {
        subcompetency_name: subcompName,
        questions: questionsArr
      };
  
      // Return the result object as the response
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.send("Error fetching questions");
    });
  });
  
  

//Get CompetencyId !
router.get('/getcompetencyquestion/:competencyId', async (req, res) => {
    const competencyId = req.params.competencyId;

    try {
        const human = await HumanR.find({ "subCompetency.subBeahviourList.Question.competencyId": competencyId });
        
        if (human.length === 0) {
            return res.status(404).json({ message: 'No Question found with the given competency ID.' });
        }
        
        const questionList = human.flatMap(h => h.subCompetency.flatMap(s => s.subBeahviourList.flatMap(q => q.Question.filter(c => c.competencyId === competencyId))));
        
        res.status(200).json(questionList);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete Get Competency Question!

router.delete('/deletequestion/:id', async (req, res) => {
    const questionId = req.params.id;
  
    try {
      // Find the document that contains the question ID
      const document = await HumanR.findOne({ 'subCompetency.subBeahviourList.Question._id': questionId });
      if (!document) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      // Update the document to remove the question ID
      await HumanR.updateOne(
        { 'subCompetency.subBeahviourList.Question._id': questionId },
        { $pull: { 'subCompetency.$[].subBeahviourList.$[].Question': { _id: questionId } } }
      );
  
      return res.status(200).json({ message: 'Question deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  
// Update Get Competency Question!
  router.put('/updatequestion/:id', async (req, res) => {
    const questionId = req.params.id;
    const { question, options } = req.body;
  
    try {
      // Find the document that contains the question ID
      const document = await HumanR.findOne({ 'subCompetency.subBeahviourList.Question._id': questionId });
      if (!document) {
        return res.status(404).json({ message: 'Question not found' });
      }
  
      // Update the question and its options in the document
      await HumanR.updateOne(
        { 'subCompetency.subBeahviourList.Question._id': questionId },
        { $set: { 'subCompetency.$[].subBeahviourList.$[].Question.$[question].question': question, 'subCompetency.$[].subBeahviourList.$[].Question.$[question].options': options } },
        { arrayFilters: [{ 'question._id': questionId }] }
      );
  
      return res.status(200).json({ message: 'Question updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  
// Delete
router.put('/updatequestion/:questionId', async (req, res) => {
    const questionId = req.params.questionId;
    
    try {
        // Find the HumanR document containing the question with the given questionId
        const human = await HumanR.findOne({ "subCompetency.subBeahviourList.Question._id": questionId });
        
        if (!human) {
            return res.status(404).json({ message: 'No Question found with the given ID.' });
        }

        // Find the subCompetency and subBehaviourList containing the question with the given questionId
        let subCompetencyIndex = -1;
        let subBehaviourListIndex = -1;
        let questionIndex = -1;
        human.subCompetency.forEach((subCompetency, i) => {
            subCompetency.subBeahviourList.forEach((subBehaviourList, j) => {
                const index = subBehaviourList.Question.findIndex(q => q._id.equals(questionId));
                if (index !== -1) {
                    subCompetencyIndex = i;
                    subBehaviourListIndex = j;
                    questionIndex = index;
                }
            });
        });
        
        if (subCompetencyIndex === -1 || subBehaviourListIndex === -1 || questionIndex === -1) {
            return res.status(404).json({ message: 'No Question found with the given ID.' });
        }

        // Update the question with the new data
        const { competencyId, question, weight } = req.body;
        human.subCompetency[subCompetencyIndex].subBeahviourList[subBehaviourListIndex].Question[questionIndex] = {
            _id: questionId,
            competencyId,
            question,
            weight
        };

        // Save the updated HumanR document
        await human.save();

        res.status(200).json({ message: 'Question updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/removequestion/:questionId', async (req, res) => {
    const question_Id = req.body._id;

    try {
        // Find the HumanR document containing the question with the given questionId
        const human = await HumanR.findOne({ "subCompetency.subBeahviourList.Question._id": question_Id });
        
        if (!human) {
            return res.status(404).json({ message: 'No Question found with the given ID.' });
        }

        // Find the subCompetency and subBehaviourList containing the question with the given questionId
        let subCompetencyIndex = -1;
        let subBehaviourListIndex = -1;
        let questionIndex = -1;
        human.subCompetency.forEach((subCompetency, i) => {
            subCompetency.subBeahviourList.forEach((subBehaviourList, j) => {
                const index = subBehaviourList.Question.findIndex(q => q._id.equals(question_Id));
                if (index !== -1) {
                    subCompetencyIndex = i;
                    subBehaviourListIndex = j;
                    questionIndex = index;
                }
            });
        });
        
        if (subCompetencyIndex === -1 || subBehaviourListIndex === -1 || questionIndex === -1) {
            return res.status(404).json({ message: 'No Question found with the given ID.' });
        }

        // Remove the Question subdocument from the subBeahviourList
        human.subCompetency[subCompetencyIndex].subBeahviourList[subBehaviourListIndex].Question.splice(questionIndex, 1);

        // Save the updated HumanR document
        await human.save();

        res.status(200).json({ message: `Question ${question_Id} has been removed.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


        // Pull the question with the given questionId from the list of questions


// router.delete('/delete/:_id', (req, res) => {
//     const id = mongoose.Types.ObjectId(req.params._id);
//     HumanR.findOneAndRemove({ "subCompetency.subBeahviourList.Question._id": id }).then(category => {
//         if (category) {
//             return res.status(200).json({ success: true, message: 'the HumanR is deleted!' })
//         } else {
//             return res.status(404).json({ success: false, message: "HumanR not found!" })
//         }
//     }).catch(err => {
//         return res.status(500).json({ success: false, error: err })
//     })
// })


//Psychometric Upload True Get API !



router.get(`/get/count`, async (req, res) => {
    const strengthCount = await HumanR.countDocuments((count) => count);

    if (!strengthCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        strengthCount: strengthCount
    });
});

router.get(`/get/home/count`, async (req, res) => {
    const strengthCount = await HumanR.countDocuments((count) => count);

    if (!strengthCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        strengthCount: strengthCount
    });
});

router.get(`/get/counts`, async (req, res) => {
    const categoryCount = await Category.countDocuments((count) => count);

    if (!categoryCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        categoryCount: categoryCount
    });
});


router.get(`/get/homefeatured/:count`, async (req, res) => {

    const count = req.params.count ? req.params.count : 0;
    const strengths = await HumanR.find({ isHomeFeatured: true }).limit(+count);

    if (!strengths) {
        res.status(500).json({ success: false });
    }
    res.send(strengths);
});

router.get(`/get/featured/:count`, async (req, res) => {

    const count = req.params.count ? req.params.count : 0;
    const strengths = await HumanR.find({ isFeatured: true }).limit(+count);

    if (!strengths) {
        res.status(500).json({ success: false });
    }
    res.send(strengths);
});

router.post('/api/analysis-result', async (req, res) => {
    console.log(req.body);
    const prompt = req.body.prompt;
    const model = "text-davinci-003";
    const maxTokens = 256 || 1024; // Increase the default to 1024
    const temperature=0.7;
    const top_p=1;
    const frequency_penalty=0;
    const presence_penalty=0;
  
    try {
      const response = await openai.createCompletion({
        model: model,
        prompt: prompt,
        max_tokens: maxTokens,
        temperature:temperature,
        top_p:top_p,
        frequency_penalty:frequency_penalty,
        presence_penalty:presence_penalty,
      });
    const generatedText = response.data.choices[0].text;
    console.log(generatedText); // Print the generated text to the console
    res.status(200).send(generatedText);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
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