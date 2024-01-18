const express = require('express');
const router = express.Router();
const AssignmentTest = require('../models/assignment');

  router.get('/get-assignment/:expertId', async (req, res) => {
    try {
      const expertId = req.params.expertId;
      const assignments = await AssignmentTest.find({ expertId }).populate('expertId assessmentId').select('-expertId');
  
      res.status(200).json({ assignments });
    } catch (error) {
      console.error('Error retrieving assignments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.get('/assignments/forItem/:itemId', async (req, res) => {
    try {
      const { itemId } = req.params;
      const { expertId } = req.query;
  
      // Fetch assigned assessments for the specified item and expert
      const assignments = await AssignmentTest.find({ itemId, expertId });
  
      res.status(200).json({ assignments, isAssigned });
    } catch (error) {
      console.error('Error fetching assigned assessments for item:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
router.post('/assign', async (req, res) => {
    console.log(req.body);
  try {
    const { assessmentId, expertId } = req.body;

    // Create a new assignment
    const assignment = new AssignmentTest({ assessmentId, expertId });

    // Save the assignment to the database
    await assignment.save();

    // Set a timeout to automatically remove the assignment after 2 days
    setTimeout(async () => {
      // Remove the assignment from the database
      await AssignmentTest.findByIdAndRemove(assignment._id);
      console.log(`Assignment ${assignment._id} removed after 2 days.`);
    }, 2 * 24 * 60 * 60 * 1000); // 2 days in milliseconds

    res.status(200).json({ message: 'Assignment created successfully.' });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
