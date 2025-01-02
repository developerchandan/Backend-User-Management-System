const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/add', async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, Email, and Role are required' });
    }

    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete/:id', async (req, res) => {
  console.log(req.params);

  try {
    const { id } = req.params; 

    const deletedUser = await User.findOneAndDelete({ _id: id }); 

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});


router.put('/update-status/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const user = await User.findOneAndUpdate(
      { _id: id },
      { status: 'Inactive' }, 
      { new: true } 
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User status updated to Inactive', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' }); 
  }
});


module.exports = router;
