const express = require('express');
const { Expert} = require('../models/expert');
const { json } = require('body-parser');
const route = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
// Configure the AWS SDK with your credentials
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    region: process.env.AWS_REGION
  });
  
  // Create an instance of the S3 service
  const s3 = new AWS.S3();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5242880 }, // 5 MB
    fileFilter: function(req, file, cb) {
      // Check if the file is an image
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  });

  route.get('/', async (req, res) => {
    try {
      const expertResources = await Expert.find();
  
      if (!expertResources || expertResources.length === 0) {
        return res.status(404).json({ message: 'No expert resources found.' });
      }
  
      res.status(200).json(expertResources);
    } catch (error) {
      console.error('Error fetching expert resources:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

route.post("/register", async(req, res) => {
    try{
        const expertRegister=new Expert({

        name:req.body.name,
        email:req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        profileimage:req.body.profileimage,
        phone:req.body.phone,
        address:req.body.address,
        role:req.body.role,
        city:req.body.city,
        state:req.body.state,
        pinCode:req.body.pinCode,
        country:req.body.country,
        nationality:req.body.nationality,
        martial:req.body.martial,
        educations:req.body.educations,
        professions:req.body.professions,
        achivements:req.body.achivements,
        resume:req.body.resume,
        });

        if(!expertRegister){
            return res.status(404).json({ msg: 'Page not found!' })
        }

        const expertSave=await expertRegister.save();
        return res.status(200).json({ msg: 'Expert register successfully!' })
    }
    catch(err){
        res.status(500).json({ msg: 'Something went wrong' })
    }
});


route.get('/register', async(req, res) => {
    try{

        const findData = await Expert.find();
        res.status(200).send(findData)

    }catch(error){
        res.status(500).send("internal Server error")
    }
});


route.get(`/:id`, async (req, res) => {
    const ID = req.params.id;

    try {
        const findDataId = await Expert.findById(ID);

        if (!findDataId) {
            return res.status(404).send("Data is not found!");
        }

        res.status(200).send(findDataId);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong!");
    }
});


route.delete('/register/:id', async(req, res) => {
    const ID=req.params.id;
    try {

        
        const deleteData = await Expert.findByIdAndDelete(ID);

        if( !deleteData ){
            res.status(400).send("Data is already deleted!");
        }
        res.status(200).send("Data is deleted!")
        
    } catch (error) {
        res.status(500).send("internal Server error")
    }
});



route.post('/login', async (req, res) => {
    console.log(req.body);
    try {
      const expert = await Expert.findOne({ email: req.body.email });
      if (!expert) {
        return res.json({ msg: 'Invalid Email!!' });
      }
  
      const passwordMatches = await bcrypt.compare(req.body.password, expert.passwordHash);
      if (!passwordMatches) {
        return res.json({ msg: 'Incorrect password!!' });
      }
  
      console.log("login success");
      const payload = {
        subject: expert._id,
        email: expert.email,
        expertId: expert._id 
      };
      const token = jwt.sign(payload, 'secret');
      res.status(200).send({
        token: token,   
        role: expert.role,
        email: expert.email,
        name: expert.name,
        contact: expert.phone,
        expertId: expert._id 
      });
  
    } catch (error) {
      console.log(error);
      res.json({ msg: 'Something went wrong' });
    }
  });

// route.put('/expert/:id', async(req, res) =>{
//     console.log(req.body);
//     const ID = req.params.id;
//     try{

//         const updateData = await Expert.findByIdAndUpdate(ID, req.body);

//         if(!updateData){
//             return res.status(400).json({ error: "Data is not found!" });
//         }

//         res.status(200).json({ message: "Data update successfully!" });
//     }
//     catch(error){
//         res.status(500).json({ error: "Internal Server error" });
//     }
    
// });


route.put('/expert-profile/:id', async (req, res) => {
    console.log(req.body)
    const ID = req.params.id;
    const { profileimage, ...updateFields } = req.body; // Separate profileimage from other fields

    try {
        // Update other fields in the database
        const updateData = await Expert.findByIdAndUpdate(ID, updateFields, { new: true });

        if (!updateData) {
            return res.status(400).json({ error: "Data is not found!" });
        }

        // If a new profile image is provided, upload it to AWS S3
        if (profileimage) {
            const s3Params = {
                Bucket: 'sudakshtas',
                Body: Buffer.from(profileimage, 'base64'), // Assuming the image is sent as a base64 string
                Key: `${uuidv4()}-${file.originalname}`,
            };

            // Upload the image to S3
            await s3.upload(s3Params).promise();

            // Update the profileimage field in the database with the S3 URL
            updateData.profileimage = `https://sudakshtas.s3.ap-south-1.amazonaws.com/${s3Params.Key}`;
            await updateData.save();
        }

        res.status(200).json({ message: "Data updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server error" });
    }
});

// Express route for handling image uploads
// route.post('/upload-image', upload.single('file'), (req, res) => {
//     const file = req.file;
  
//     if (!file) {
//       return res.status(400).json({ message: 'No file provided' });
//     }
  
//     const params = {
//         Bucket: 'sudakshtas',
//         // Key: `${user._id}/profile-image.jpg`,

//         Key: `${uuidv4()}-${file.originalname}`,
//         Body: req.file.buffer,
//     };
  
//     s3.upload(params, (err, data) => {
//       if (err) {
//         console.error('Error uploading image to S3:', err);
//         return res.status(500).json({ message: 'Failed to upload image' });
//       }
  
//       const imageUrl = data.Location;
//       res.json({ imageUrl });
//     });
//   });
  
  // Express route for handling image uploads
route.post('/upload-image', upload.single('file'), (req, res) => {
    const file = req.file;
  
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }
  
    const params = {
        Bucket: 'sudakshtas',
        // Key: `${user._id}/profile-image.jpg`,

        Key: `${uuidv4()}-${file.originalname}`,
        Body: req.file.buffer,
    };
  
    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading image to S3:', err);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
  
      const imageUrl = data.Location;
      res.json({ imageUrl });
    });
  });
// Express route for updating expert profile, including profile image
route.put('/expert-profiless/:id', upload.single('profileImage'), async (req, res) => {
    const ID = req.params.id;
    const updateData = req.body;
  
    try {
      // Check if a profile image was uploaded
      if (req.file) {
        const params = {
          Bucket: 'sudakshtas',
          Key: `${uuidv4()}-${req.file.originalname}`,
          Body: req.file.buffer,
        };
  
        s3.upload(params, (err, data) => {
          if (err) {
            console.error('Error uploading image to S3:', err);
            return res.status(500).json({ message: 'Failed to upload image' });
          }
  
          // Update the expert's profile image URL in the updateData
          updateData.profileImage = data.Location;
  
          // Continue with updating the expert data in the database
          updateExpertData(ID, updateData, res);
        });
      } else {
        // No profile image uploaded, directly update the expert data in the database
        updateExpertData(ID, updateData, res);
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server error' });
    }
  });
  
  // Function to update expert data in the database
  async function updateExpertData(ID, updateData, res) {
    const options = { new: true }; // Return the modified document rather than the original
  
    const updatedExpert = await Expert.findByIdAndUpdate(ID, updateData, options);
  
    if (!updatedExpert) {
      return res.status(400).json({ error: 'Data is not found!' });
    }
  
    res.status(200).json({ message: 'Data updated successfully!', updatedExpert });
  }  
module.exports=route;