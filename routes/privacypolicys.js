const express = require('express');
const router = express.Router();
const { PrivacyPolicy } = require('../models/privacypolicy');
const multer = require('multer');
const AWS = require('aws-sdk');

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


router.get('/get-privacy-policy', async (req, res) => {
    const privacyPolicy = await PrivacyPolicy.find();
      
    if (!privacyPolicy) {
        res.status(500).json({ message: 'The privacy Policy list not found.' })
    }
    res.status(200).send(privacyPolicy);
})

router.get('/:id', async (req, res) => {
    const privacyPolicy = await PrivacyPolicy.findById(req.params.id);
      
    if (!privacyPolicy) {
        res.status(500).json({ message: 'The Privacy Policy with the given ID was not found.' })
    }
    res.status(200).send(privacyPolicy);
})

//@ Add items..

router.post('/add-privacy-policy', upload.single('image'), async (req, res) => {
    console.log("PrivacyPolicy",req.body);
    let params = {
        Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
        Key: req.file.originalname,
        Body: req.file.buffer,
    };

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    console.log(fileName);


    let privacyPolicyResource = new PrivacyPolicy({

        name: req.body.name,
        shortDescription: req.body.shortDescription,
        richDescription: req.body.richDescription,
        
    })
    privacyPolicyResource = await privacyPolicyResource.save();

    if (!privacyPolicyResource)
        return res.status(400).send('the Privacy Policy Resource cannot be created!')

    s3.upload(params, (err, result) => {

        if (err) {
            console.log('upload failed')
            res.status(500).json({
                message: "Failed to upload file",
                error: err.message,
            });
        }
        else {

            PrivacyPolicy.findByIdAndUpdate({ _id: privacyPolicyResource._id }, {
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


router.put('/:id', upload.single('image'), async (req, res) => {
    let updatedPrivacyPolicy = {};
  
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
        updatedPrivacyPolicy.image = data.Location;
      } catch (err) {
        console.log(err);
        return res.status(500).send('Error uploading image to S3');
      }
    }
  
    updatedPrivacyPolicy.name = req.body.name;
    updatedPrivacyPolicy.shortDescription = req.body.shortDescription;
    updatedPrivacyPolicy.richDescription = req.body.richDescription;
  
    try {
      const privacyPolicy = await PrivacyPolicy.findByIdAndUpdate(req.params.id, updatedPrivacyPolicy, { new: true });
      res.send(privacyPolicy);
    } catch (err) {
      console.log(err);
      res.status(500).send('Error updating PrivacyPolicy');
    }
  });


//@ Delete items..

router.delete('/:id', (req, res) => {
    PrivacyPolicy.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the PrivacyPolicy is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "PrivacyPolicy not found!" })
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