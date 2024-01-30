const {Assessment} = require('../models/psychometricassessment');
const express = require('express');
const router = express.Router();
const {UnMask} = require('../models/unmask');
const moment = require('moment');

router.get('/all-unmask-entries', async (req, res) => {
  try {
    // Retrieve all UnMask entries
    const unmaskEntries = await UnMask.find().populate('userId psychometricId');

    if (!unmaskEntries || unmaskEntries.length === 0) {
      return res.status(404).json({ message: 'No UnMask entries found.' });
    }

    res.status(200).json(unmaskEntries);
  } catch (err) {
    console.error('Error fetching UnMask entries:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/data/:userId/:psychometricResultId', async (req, res) => {
  const { userId, psychometricResultId } = req.params;

  try {
    const data = await Assessment.findOne({
      userId,
      psychometricResultId,
    }).sort({ createdAt: -1 });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get(`/`, async (req, res) =>{
    const assessmentData = await Assessment.find().sort({ name: 1 }).populate();

    if(!assessmentData) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(assessmentData);
})

router.get('/:id', async(req,res)=>{
    const assessment = await Assessment.findById(req.params.id).sort({ name: 1 });

    if(!assessment) {
        res.status(500).json({message: 'The assessment with the given ID was not found.'})
    } 
    res.status(200).send(assessment);
})
router.get('/psychometric/:psychometricResultId', async (req, res) => {
    try {
      const psychometricResultId = req.params.psychometricResultId;
  
      // Find assessments that match the provided psychometricResultId
      const assessments = await Assessment.find({ psychometricResultId });
  
      if (!assessments || assessments.length === 0) {
        return res.status(404).json({ error: 'Assessment not found' });
      }
  
      res.json(assessments);
    } catch (error) {
      console.error('Error retrieving assessment:', error);
      res.status(500).json({ error: 'Could not retrieve assessment data' });
    }
  });
  

router.post('/add-assessments', async (req, res) => {
  console.log(req.body)
    try {
      const assessmentData = req.body; 
  
      // Create a new assessment document
      const assessment = new Assessment(assessmentData);
  
      // Save the assessment to the database
      await assessment.save();
  
      res.status(201).json(assessment); 
    } catch (error) {
      console.error('Error creating assessment:', error);
      res.status(500).json({ error: 'Could not create assessment' });
    }
  });

router.put('/:id',async (req, res)=> {
    const assessment = await Assessment.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            color: req.body.color,
        },
        { new: true}
    )

    if(!assessment)
    return res.status(400).send('the assessment cannot be created!')

    res.send(assessment);
})




router.delete('/:id', (req, res)=>{
    Assessment.findByIdAndRemove(req.params.id).then(assessment =>{
        if(assessment) {
            return res.status(200).json({success: true, message: 'the assessment is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "assessment not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})


router.get('/get-unmask-reports/:userId/:psychometricId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const psychometricId = req.params.psychometricId;

    // Find expert reports by userId and psychometricId
    const userUnmaskReports = await UnMask.find({ userId, psychometricId })
      .sort({ createdAt: -1 })


    res.status(200).json({ userUnmaskReports });
  } catch (error) {
    console.error('Error fetching expert reports:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/get-unmask/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find UnMask data based on userId
    const unmaskData = await UnMask.findOne({ userId: userId })
    .sort({ createdAt: -1 }) ;
    

    if (!unmaskData) {
      return res.status(404).json({ error: 'UnMask data not found for the specified userId' });
    }

    res.status(200).json(unmaskData);
  } catch (err) {
    console.error('Error retrieving UnMask data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST API to create a new UnMask entry
router.post('/add-unmask', async (req, res) => {
  try {
    const { userId, psychometricId, listOfAllData, reportA } = req.body;

    // Create a new UnMask document
    const unmask = new UnMask({
      userId: userId,
      psychometricId: psychometricId,
      questionAndAnswer: listOfAllData,
      reportA: reportA 
    });

    // Save the UnMask document to the database
    const savedUnMask = await unmask.save();

    console.log('UnMask created successfully');
    res.status(201).json(savedUnMask);
  } catch (err) {
    console.error('Error creating UnMask:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports =router;