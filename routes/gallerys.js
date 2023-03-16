const express = require('express');
const router = express.Router();
const { Gallery } = require('../models/gallery');
const multer = require('multer');
const AWS = require('aws-sdk');
const bodyParser = require("body-parser");

AWS.config.update({
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});


var s3 = new AWS.S3();


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'video/mp4': 'mp4',
    'video/mpeg': 'mpeg',
    'video/webm': 'webm'
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


router.get('/getgalleryList', async (req, res) => {
    const gallery = await Gallery.find();
      
    if (!gallery) {
        res.status(500).json({ message: 'The gallery list not found.' })
    }
    res.status(200).send(gallery);
})


router.get('/:id', async (req, res) => {
    const gallery = await Gallery.findById(req.params.id);
      

    if (!gallery) {
        res.status(500).json({ message: 'The gallery with the given ID was not found.' })
    }
    res.status(200).send(gallery);
})

//@ Add items..

router.post('/addgallery', upload.single('video'), async (req, res) => {
    console.log("gallery",req.body);
    let params = {
        Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
        Key: req.file.originalname,
        Body: req.file.buffer,
    };

    const file = req.file;
    if (!file) return res.status(400).send('No video in the request');

    const fileName = file.filename;
    console.log(fileName);


    let galleryResource = new Gallery({

        name: req.body.name,
        description: req.body.description,
        richdescription: req.body.richdescription,
        
    })
    galleryResource = await galleryResource.save();

    if (!galleryResource)
        return res.status(400).send('The Gallery cannot be created!')

    s3.upload(params, (err, result) => {

        if (err) {
            console.log('Upload failed')
            res.status(500).json({
                message: "Failed to upload file",
                error: err.message,
            });
        }
        else {

            Gallery.findByIdAndUpdate({ _id: galleryResource._id }, {
                $set: {
                    video: result.Location
                }
            }).then((data) => {

                res.json({ data });}).catch((e) => {
                res.send(e)
            })
        }

    })

})






router.put('/:id', upload.single('image'), async (req, res) => {

    const updateGallery = await Gallery.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        description: req.body.description,
        richdescription: req.body.richdescription,
        },
        { new: true }
    );

    if (!updateGallery) return res.status(500).send('The Gallery cannot be updated!');

    res.send(updateGallery);
});


//@ Delete items..

router.delete('/:id', (req, res) => {
    Gallery.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'The Gallery is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "Gallery not found!" })
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