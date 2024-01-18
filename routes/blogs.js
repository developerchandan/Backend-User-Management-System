const express = require('express');
const router = express.Router();
const { Blog } = require('../models/blog');
const multer = require('multer');
const AWS = require('aws-sdk');
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

const upload = multer({
    limits: { fieldSize: 10 * 1024 * 1024 } // Increase the fieldSize limit to 10MB
  });

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


router.get('/getblogsList', async (req, res) => {
    const blog = await Blog.find();
      
    if (!blog) {
        res.status(500).json({ message: 'The blog list not found.' })
    }
    res.status(200).send(blog);
})

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
      

    if (!blog) {
        res.status(500).json({ message: 'The blog with the given ID was not found.' })
    }
    res.status(200).send(blog);
})

router.get('/d/:uniquename', async (req, res) => {
  console.log(req.params.uniquename);
  const blog = await Blog.findOne({ uniquename: req.params.uniquename });
    
  if (!blog) {
      return res.status(404).json({ message: 'The blog with the given ID was not found.' });
  }
  
  res.status(200).send(blog);
});

//@ Add items..

router.post('/addblog', upload.single('image'), async (req, res) => {
  console.log("Blog", req.body);
  let params = {
      Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
      Key: req.file.originalname,
      Body: req.file.buffer,
  };

  const file = req.file;
  if (!file) return res.status(400).send('No image in the request');

  const fileName = file.filename;
  console.log(fileName);

  // Generate unique blog title with hyphens instead of spaces
  const uniqueBlogTitle = req.body.name.replace(/\s+/g, '-');

  let blogResource = new Blog({
      name: req.body.name,
      uniquename: uniqueBlogTitle,
      description: req.body.description,
      richdescription: req.body.richdescription,
  });

  blogResource = await blogResource.save();

  if (!blogResource)
      return res.status(400).send('The blogResource cannot be created!');

  s3.upload(params, (err, result) => {
      if (err) {
          console.log('Upload failed');
          res.status(500).json({
              message: 'Failed to upload file',
              error: err.message,
          });
      } else {
          Blog.findByIdAndUpdate({ _id: blogResource._id }, {
              $set: {
                  image: result.Location
              }
          }).then((data) => {
              console.log(data);
              res.json({ data });
          }).catch((e) => {
              res.send(e);
          });
      }
  });
});



// Add Multiple file in S3 server !
router.post('/add-multiple-image-blog', upload.array('images'), async (req, res) => {
    console.log("Blog", req.body);
    
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send('No files in the request');
    }
  
    const fileNames = files.map(file => file.filename);
    console.log(fileNames);
  
    let blogResource = new Blog({
      name: req.body.name,
      description: req.body.description,
      richdescription: req.body.richdescription,
    });
  
    blogResource = await blogResource.save();
  
    if (!blogResource) {
      return res.status(400).send('The blogResource cannot be created!');
    }
  
    const uploadPromises = files.map(file => {
      const params = {
        Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
        Key: file.originalname,
        Body: file.buffer,
      };
  
      return new Promise((resolve, reject) => {
        s3.upload(params, (err, result) => {
          if (err) {
            console.log('Upload failed:', err);
            reject(err);
          } else {
            Blog.findByIdAndUpdate({ _id: blogResource._id }, {
              $push: {
                images: result.Location
              }
            }).then((data) => {
              console.log(data);
              resolve();
            }).catch((e) => {
              reject(e);
            });
          }
        });
      });
    });
  
    try {
      await Promise.all(uploadPromises);
      res.json({ data: blogResource });
    } catch (error) {
      res.status(500).json({
        message: "Failed to upload file",
        error: error.message,
      });
    }
  });
  



// router.put('/:id', upload.single('image'), async (req, res) => {

//     const updatedBlog = await Blog.findByIdAndUpdate(
//         req.params.id,
//         {
//         name: req.body.name,
//         description: req.body.description,
//         richdescription: req.body.richdescription,
//         },
//         { new: true }
//     );

//     if (!updatedBlog) return res.status(500).send('the Blog cannot be updated!');

//     res.send(updatedBlog);
// });

router.put('/:id', upload.single('image'), async (req, res) => {
    let updatedBlog = {};
  
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
        updatedBlog.image = data.Location;
      } catch (err) {
        console.log(err);
        return res.status(500).send('Error uploading image to S3');
      }
    }
  
    updatedBlog.name = req.body.name;
    updatedBlog.description = req.body.description;
    updatedBlog.richdescription = req.body.richdescription;
  
    try {
      const blog = await Blog.findByIdAndUpdate(req.params.id, updatedBlog, { new: true });
      res.send(blog);
    } catch (err) {
      console.log(err);
      res.status(500).send('Error updating Blog');
    }
  });


//@ Delete items..

router.delete('/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the Blog is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "Blog not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})






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