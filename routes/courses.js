const { Course } = require('../models/course');
const express = require('express');
const { Coursecategory } = require('../models/course_category');
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
    if (req.query.coursecategories) {
        filter = { coursecategory: req.query.coursecategories.split(',') };
    }

    const courseList = await Course.find(filter).populate('coursecategory');

    if (!courseList) {
        res.status(500).json({ success: false });
    }
    res.send(courseList);
});

router.get(`/:id`, async (req, res) => {
    const course = await Course.findById(req.params.id).populate('coursecategory');

    if (!course) {
        res.status(500).json({ success: false });
    }
    res.send(course);
});
// #######################################################

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const coursecategory = await Coursecategory.findById(req.body.coursecategory);
    if (!coursecategory) return res.status(400).send('Invalid state course category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let course = new Course({
        collageName: req.body.collageName,
        courseName:req.body.courseName,
        fee:req.body.fee,
        courseDuration:req.body.courseDuration,
        examAccepted:req.body.examAccepted,
        studyMode:req.body.studyMode,
        university:req.body.university,
        url:req.body.url,
        examDate:req.body.examDate,
        location:req.body.location,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        coursecategory: req.body.coursecategory,
        isFeatured: req.body.isFeatured
    });

    course = await course.save();

    if (!course) return res.status(500).send('The course cannot be created');

    res.send(course);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Course Id');
    }
    const coursecategory = await Coursecategory.findById(req.body.coursecategory);
    if (!coursecategory) return res.status(400).send('Invalid Course Category');

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(400).send('Invalid course!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = course.image;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        {
            collageName: req.body.collageName,
            courseName:req.body.courseName,
            fee:req.body.fee,
            courseDuration:req.body.courseDuration,
            examAccepted:req.body.examAccepted,
            studyMode:req.body.studyMode,
            university:req.body.university,
            overview:req.body.overview,
            highlight:req.body.highlight,
            url:req.body.url,
            examDate:req.body.examDate,
            location:req.body.location,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            coursecategory: req.body.coursecategory,
           
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!updatedCourse) return res.status(500).send('the Course cannot be updated!');

     res.send(updatedCourse);
    
});


router.delete('/:id', (req, res) => {
    Course.findByIdAndRemove(req.params.id)
        .then((course) => {
            if (course) {
                return res.status(200).json({
                    success: true,
                    message: 'the Course is deleted!'
                });
            } else {
                return res.status(404).json({ success: false, message: 'course not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const courseCount = await Course.countDocuments((count) => count);

    if (!courseCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        courseCount: courseCount
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const courses = await Course.find({ isFeatured: true }).limit(+count);

    if (!courses) {
        res.status(500).json({ success: false });
    }
    res.send(courses);
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Course Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!course) return res.status(500).send('the gallery cannot be updated!');

    res.send(course);
});

module.exports = router;
