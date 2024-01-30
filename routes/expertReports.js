const express = require('express');
const router = express.Router();
const ExpertReport = require('../models/expertReport');


router.get('/get-expert-reports/:userId/:psychometricId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const psychometricId = req.params.psychometricId;
  
      // Find expert reports by userId and psychometricId
      const expertReports = await ExpertReport.find({ userId, psychometricId })
        .sort({ createdAt: -1 })
        .limit(1);
  
      res.status(200).json({ expertReports });
    } catch (error) {
      console.error('Error fetching expert reports:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

router.post('/submit-expert-report', async (req, res) => {
    
    try {
        const { userid, expertreport, psychometricId,overallFeedback,advice } = req.body;

        const newReport = new ExpertReport({
            userId: userid,
            psychometricId: psychometricId,
            overallFeedback: overallFeedback,
            advice: advice,
            expertReports: [] 
        });

        const savedReport = await newReport.save();

        // Add reports to the expertReports array in the saved document
        for (const report of expertreport) {
            savedReport.expertReports.push({
                question: report.question,
                answer: Array.isArray(report.answer) ? report.answer.join(', ') : report.answer,
                feedback: report.feedback || null
            });
        }

        await savedReport.save();

        res.status(201).json(savedReport);
    } catch (error) {
        console.error('Error saving expert reports:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
