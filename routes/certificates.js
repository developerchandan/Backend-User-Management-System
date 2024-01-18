const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const Course = require('../models/certificate');
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const s3 = new AWS.S3({
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION
});

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const upload = multer({
  limits: { fieldSize: 10 * 1024 * 1024 } // Increase the fieldSize limit to 10MB
});

// router.post('/courses', upload.fields([
//   { name: 'videos', maxCount: 5 },
//   { name: 'pdfs', maxCount: 5 }
// ]), async (req, res) => {
//   console.log(req.body.curriculum);

//   try {
//     const {
//       title,
//       instructor,
//       description,
//       duration,
//       curriculum
//       // Add other fields as needed
//     } = req.body;

//     // Retrieve the uploaded files from req.files or req.body depending on the content type
//     const uploadedVideos = req.files ? req.files.videos || [] : [];
//     const uploadedPDFs = req.files ? req.files.pdfs || [] : [];
//     console.log(req.files);
//     // Function to upload a file to S3
//     async function uploadFileToS3(bucketName, fileKey, file) {
//       const params = {
//         Bucket: bucketName,
//         Key: fileKey,
//         Body: file
//       };

//       try {
//         const result = await s3.upload(params).promise();
//         return result.Location;
//       } catch (error) {
//         console.error('Error uploading file to S3:', error);
//         throw error;
//       }
//     }

//     // Upload videos to S3
//     for (const file of uploadedVideos) {
//       if (file.buffer) {
//         const fileKey = `${Date.now()}_${file.originalname}`;
//         try {
//           const fileUrl = await uploadFileToS3(process.env.AWS_BUCKET_SUDAKSHTA, fileKey, file.buffer);
//           uploadedVideos.push({ title: file.originalname, url: fileUrl });
//         } catch (error) {
//           console.error('Error uploading video to S3:', error);
//         }
//       }
//     }

//     // Upload PDFs to S3
//     for (const file of uploadedPDFs) {
//       if (file.buffer) {
//         const fileKey = `${Date.now()}_${file.originalname}`;
//         try {
//           const fileUrl = await uploadFileToS3(process.env.AWS_BUCKET_SUDAKSHTA, fileKey, file.buffer);
//           uploadedPDFs.push({ title: file.originalname, url: fileUrl });
//         } catch (error) {
//           console.error('Error uploading PDF to S3:', error);
//         }
//       }
//     }

//     // Create a new course instance with uploaded file URLs
//     const course = new Course({
//       title,
//       instructor,
//       description,
//       duration,
//       curriculum,
//       videos: uploadedVideos,
//       pdfs: uploadedPDFs
//       // Assign other fields as needed
//     });

//     // Save the course to the database
//     const savedCourse = await course.save();

//     res.status(201).json(savedCourse);
//   } catch (error) {
//     console.error('Error creating course:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// Function to upload a file to S3

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ data: courses });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ data: course });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add Course !!
router.post('/courses', upload.single('image'), async (req, res) => {
  console.log("courses", req.body);
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
  const uniqueCourseTitle = req.body.title.replace(/\s+/g, '-');

  let courseResource = new Course({
    uniqutitle: uniqueCourseTitle,
    title: req.body.title,
    instructor: req.body.instructor,
    curriculum:req.body.curriculum,
    description: req.body.description,
    duration: req.body.duration,
    richdescription: req.body.richdescription,
  });

  courseResource = await courseResource.save();

  if (!courseResource)
      return res.status(400).send('The courseResource cannot be created!');

  s3.upload(params, (err, result) => {
      if (err) {
          console.log('Upload failed');
          res.status(500).json({
              message: 'Failed to upload file',
              error: err.message,
          });
      } else {
        Course.findByIdAndUpdate({ _id: courseResource._id }, {
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

// Update Course Section !!
router.put('/courses/:id', upload.single('image'), async (req, res) => {

  const courseId = req.params.id;

  if (!courseId) return res.status(400).send('Course ID is missing');

  let courseUpdates = {
    title: req.body.title,
    instructor: req.body.instructor,
    curriculum: req.body.curriculum,
    description: req.body.description,
    duration: req.body.duration,
    richdescription: req.body.richdescription,
  };

  if (req.file) {
    let params = {
      Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
      Key: req.file.originalname,
      Body: req.file.buffer,
    };

    s3.upload(params, (err, result) => {
      if (err) {
        console.log('Upload failed');
        res.status(500).json({
          message: 'Failed to upload file',
          error: err.message,
        });
      } else {
        courseUpdates.image = result.Location;

        updateCourse(courseId, courseUpdates, res);
      }
    });
  } else {
    updateCourse(courseId, courseUpdates, res);
  }
});

// Delete Course !!
router.delete('/courses/:id', async (req, res) => {
  const courseId = req.params.id;

  if (!courseId) return res.status(400).send('Course ID is missing');

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const imageKey = course.image;

    if (imageKey) {
      // Delete image from S3
      const params = {
        Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
        Key: imageKey
      };

      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.error('Failed to delete image from S3:', err);
        } else {
          console.log('Image deleted from S3');
        }
      });
    }

    await Course.findByIdAndRemove(courseId);

    res.json({ message: 'Course and associated image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete course',
      error: error.message
    });
  }
});


async function updateCourse(courseId, courseUpdates, res) {
  const options = { new: true };
  
  Course.findByIdAndUpdate(courseId, { $set: courseUpdates }, options)
    .then((updatedCourse) => {
      console.log(updatedCourse);
      res.json({ data: updatedCourse });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({
        message: 'Failed to update course',
        error: error.message,
      });
    });
}
// Add Section Lession title and Video And pdf Title
router.put('/courses/:id/curriculum/sections', (req, res) => {
  // console.log("HHHH", req.body.sections);
  const courseId = req.params.id;
  const { sections } = req.body;

  if (!sections) {
    res.status(400).json({ error: 'Sections data is missing' });
    return;
  }

  Course.findByIdAndUpdate(
    courseId,
    { $push: { curriculum: sections } },
    { new: true },
    (err, course) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
        return;
      }
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      res.json(course);
    }
  );
});




// Add Lession title and Video And pdf Title
// router.put('/courses/:id/curriculum/:sectionId/lessons',jsonParser,  (req, res) => {

//   const courseId = req.params.id;
//   const sectionId = req.params.sectionId;
//   const { title, videoTitle, pdfTitle } = req.body;

//   const lesson = {
//     title: title,
//     videos: [{ title: videoTitle }],
//     pdfs: [{ title: pdfTitle }],
//   };

//   console.log(req.body.title);
//   Course.findOneAndUpdate(
//     { _id: courseId, 'curriculum._id': sectionId },
//     { $push: { 'curriculum.$.lessons': lesson } },
//     { new: true },
//     (err, course) => {
//       if (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//         return;
//       }
//       if (!course) {
//         res.status(404).json({ error: 'Course or section not found' });
//         return;
//       }
//       res.json(course);
//     }
//   );
// });

async function uploadFileToS3(bucketName, fileKey, file) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: file
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

router.put('/curriculum/:lessonId/videos/:videoId', upload.single('video'), async (req, res) => {
  try {
    const { lessonId, videoId } = req.params;

    // Find the course that contains the curriculum
    const course = await Course.findOne({ 'curriculum.lessons._id': lessonId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Find the lesson within the course
    const curriculumIndex = course.curriculum.findIndex((curriculum) => curriculum.lessons.some((lesson) => lesson._id.toString() === lessonId));
    const lessonIndex = course.curriculum[curriculumIndex].lessons.findIndex((lesson) => lesson._id.toString() === lessonId);

    if (curriculumIndex === -1 || lessonIndex === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Find the video within the lesson
    const video = course.curriculum[curriculumIndex].lessons[lessonIndex].videos.find((video) => video._id.toString() === videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if a new video file was uploaded
    if (req.file) {
      // Upload the new video file to S3
      const fileKey = `${Date.now()}_${req.file.originalname}`;
      const fileUrl = await uploadFileToS3(process.env.AWS_BUCKET_SUDAKSHTA, fileKey, req.file.buffer);

      // Update the video URL
      video.video = fileUrl;
    }

    // Save the updated course
    await course.save();

    res.json({ message: 'Video updated successfully' });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.put('/curriculum/:lessonId/pdfs/:pdfId', upload.single('pdf'), async (req, res) => {
  console.log(req.body);
  try {
    const { lessonId, pdfId } = req.params;

    // Find the course that contains the curriculum
    const course = await Course.findOne({ 'curriculum.lessons._id': lessonId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Find the lesson within the course
    const curriculumIndex = course.curriculum.findIndex((curriculum) => curriculum.lessons.some((lesson) => lesson._id.toString() === lessonId));
    const lessonIndex = course.curriculum[curriculumIndex].lessons.findIndex((lesson) => lesson._id.toString() === lessonId);

    if (curriculumIndex === -1 || lessonIndex === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Find the PDF within the lesson
    const pdf = course.curriculum[curriculumIndex].lessons[lessonIndex].pdfs.find((pdf) => pdf._id.toString() === pdfId);

    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    // Check if a new PDF file was uploaded
    if (req.file) {
      // Upload the new PDF file to S3
      const fileKey = `${Date.now()}_${req.file.originalname}`;
      const fileUrl = await uploadFileToS3(process.env.AWS_BUCKET_SUDAKSHTA, fileKey, req.file.buffer);

      // Update the PDF details

      pdf.pdf = fileUrl;
    }

    // Save the updated course
    await course.save();

    res.json({ message: 'PDF updated successfully' });
  } catch (error) {
    console.error('Error updating PDF:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/courses/:courseId/sections/:sectionId/lessons/:lessonId/mcqs', async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const sectionId = req.params.sectionId;
    const lessonId = req.params.lessonId;
    const mcqData = req.body;

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Find the section in the course
    const section = course.curriculum.find((section) => section.id === sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Find the lesson in the section
    const lesson = section.lessons.find((lesson) => lesson.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Create the MCQ object and add it to the lesson
    const mcq = {
      title: mcqData.title,
      questions: mcqData.questions,
    };
    lesson.mcqs.push(mcq);

    // Save the course with the updated MCQ
    await course.save();

    return res.status(200).json({ message: 'MCQ added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;
