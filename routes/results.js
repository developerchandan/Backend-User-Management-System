const { Result } = require('../models/result');
const express = require('express');
const { stateCategory } = require('../models/stateCat');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

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
// #######################################################

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.statecategories) {
        filter = { statecategory: req.query.statecategories.split(',') };
    }

    const resultList = await Result.find(filter).populate('statecategory');

    if (!resultList) {
        res.status(500).json({ success: false });
    }
    res.send(resultList);
});

router.get(`/:id`, async (req, res) => {
    const result = await Result.findById(req.params.id).populate('statecategory');

    if (!result) {
        res.status(500).json({ success: false });
    }
    res.send(result);
});
// #######################################################

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const statecategory = await stateCategory.findById(req.body.statecategory);
    if (!statecategory) return res.status(400).send('Invalid state category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let result = new Result({
        name: req.body.name,
        courseName:req.body.courseName,
        university:req.body.university,
        url:req.body.url,
        examDate:req.body.examDate,
        location:req.body.location,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        statecategory: req.body.statecategory,
        isFeatured: req.body.isFeatured
    });

    result = await result.save();

    if (!result) return res.status(500).send('The result cannot be created');

    res.send(result);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Result Id');
    }
    const statecategory = await stateCategory.findById(req.body.statecategory);
    if (!statecategory) return res.status(400).send('Invalid State Category');

    const result = await Result.findById(req.params.id);
    if (!result) return res.status(400).send('Invalid result!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = result.image;
    }

    const updatedResult = await Result.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            courseName:req.body.courseName,
            university:req.body.university,
            url:req.body.url,
            examDate:req.body.examDate,
            location:req.body.location,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            statecategory: req.body.statecategory,
           
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!updatedResult) return res.status(500).send('the result cannot be updated!');

     res.send(updatedResult);
    
});


router.delete('/:id', (req, res) => {
    Result.findByIdAndRemove(req.params.id)
        .then((result) => {
            if (result) {
                return res.status(200).json({
                    success: true,
                    message: 'the result is deleted!'
                });
            } else {
                return res.status(404).json({ success: false, message: 'result not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const resultCount = await Result.countDocuments((count) => count);

    if (!resultCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        resultCount: resultCount
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const results = await Result.find({ isFeatured: true }).limit(+count);

    if (!results) {
        res.status(500).json({ success: false });
    }
    res.send(results);
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Result Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const result = await Result.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!result) return res.status(500).send('the gallery cannot be updated!');

    res.send(result);
});

module.exports = router;
