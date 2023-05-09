const { User } = require('../models/user');
var Otp = require('../models/otp');
// const { sendMail } = require('../mail/mail');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Router } = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const crypto = require('crypto');
var sendMail = require('../mail/mail');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('378973160613-88i6br7bfkfa4tpuvus266rhnlen99gq.apps.googleusercontent.com');

const { ObjectId } = require('mongodb');
// Import the necessary modules
const axios = require('axios');
const qs = require('qs');


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

  
router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false });
    }
    res.send(userList);
});

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({ message: 'The user with the given ID was not found.' });
    }
    res.status(200).send(user);
});


router.post('/getusers', async (req, res) => {
    // console.log("Hi", req.params.key);
    console.log(req.body)
    // console.log(req.body.role)
    User.find({ email: req.body.email }).select('-passwordHash').then((result) => {
        res.send({ data: result, status: 'success' })
    }).catch((e) => {
        res.send(e);
    })
});

router.post('/', async (req, res) => {
    console.log(req.body);
    let user = new User({
      userId: generateUserId(),
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        role:req.body.role,
        isEmployer: req.body.isEmployer,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });
    User.find({ email: req.body.email }, (err, users) => {
        if (err) {
            console.log('err in finding email ');
            res.json({ msg: 'some error!' });
        }
        if (users.length != 0) {
            console.log('already user with this email');
            res.json({ msg: 'already user exist with this email!' });
        }

        else {
            user.save((error, registeredUser) => {
                if (error) {
                    console.log(error);
                    res.json({ msg: "some error!" });
                }
                else {
                    let payload = { subject: registeredUser._id }
                    let token = jwt.sign(payload, 'secret')
                    res.status(200).json({ token: token })
                }
            })
        }

    });
});

router.put('/:id', async (req, res) => {

    console.log(req.body);
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            isEmployer: req.body.isEmployer,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country
        },
        { new: true }
    );

    if (!user) return res.status(400).send('the user cannot be created!');

    res.send(user);
});

// router.post('/login', (req, res) => {
//     User.findOne({ email: req.body.email }, (err, user) => {
//         if (err) {
//             console.log(err)
//             res.json({ msg: "Somthing went wrong" });
//         }
//         else {
//             if (!user) {
//                 res.json({ msg: 'Invalid Email!!' })
//             }
//             else {
//                 bcrypt.compare(req.body.password, user.passwordHash).then(match => {
//                     if (match) {
//                         console.log("login sucesssss");
//                         let payload = { subject: user._id, email: user.email }
//                         console.log("pay",payload)
//                         let token = jwt.sign(payload, 'secret')
//                         res.status(200).send({ token: token, role: user.role,email: user.email, name:user.name,contact:user.phone})
//                     }
//                     else {
//                         console.log("incoreect passss");
//                         res.json({ msg: 'Incorrect password!!' })
//                     }
//                 }).catch(err => {
//                     console.log("somthing wrong");
//                     res.json({ msg: 'Somthing went wrong' })
//                 })
//             }
//         }
//     })

// })

  router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) {
        console.log(err)
        res.json({ msg: "Something went wrong" });
      } else {
        if (!user) {
          res.json({ msg: 'Invalid Email!!' })
        } else {
          bcrypt.compare(req.body.password, user.passwordHash).then(match => {
            if (match) {
              console.log("login success");
              let payload = { subject: user._id, email: user.email }
              console.log("pay",payload)
              let token = jwt.sign(payload, 'secret')
              // reset loginAttempts to 0 after successful login
              user.updateOne({ loginAttempts: 0 }, (err) => {
                if (err) {
                  console.log(err);
                }
              });
              res.status(200).send({ token: token, role: user.role, email: user.email, name: user.name, contact: user.phone })
            } else {
              console.log("incorrect password");
              const now = new Date();
              if (user.loginAttempts >= 3 && user.lastFailedLoginAttempt && (now - user.lastFailedLoginAttempt) < 60 * 60 * 1000) {
                // If the user has reached the maximum number of login attempts within the last hour, return an error message
                res.json({ msg: 'Too many incorrect attempts. Please try again later.' })
              } else if (user.loginAttempts >= 3) {
                // If the user has reached the maximum number of login attempts and the last attempt was more than an hour ago, reset the loginAttempts counter
                if ((now - user.lastFailedLoginAttempt) >= 60 * 60 * 1000) {
                  user.loginAttempts = 1;
                  user.lastFailedLoginAttempt = now;
                  user.save((err) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                  res.json({ msg: 'Incorrect password!!' })
                } else {
                  res.json({ msg: 'Too many incorrect attempts. Please try again later.' })
                }
              } else {
                // Otherwise, increment the loginAttempts counter and set the lastFailedLoginAttempt field to the current time
                user.loginAttempts += 1;
                user.lastFailedLoginAttempt = now;
                user.save((err) => {
                  if (err) {
                    console.log(err);
                  }
                });
                res.json({ msg: 'Incorrect password!!' })
              }
            }
  
          }).catch(err => {
            console.log("something went wrong");
            res.json({ msg: 'Something went wrong' })
          })
        }
      }
    });
  });
  

// Define the Google Login route
router.post('/google-login', async (req, res) => {
    console.log(req.body);
    const { token } = req.body;
    try {
      // Verify the Google ID token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '378973160613-88i6br7bfkfa4tpuvus266rhnlen99gq.apps.googleusercontent.com'
      });
  
      // Get the user's information from the token
      const { name, email, picture } = ticket.getPayload();
  
      // Check if the user is already registered
      let user = await User.findOne({ email });
  
      if (!user) {
        // If the user is new, create a new user account
        user = new User({
          name,
          email,
          role: 'simpleUser', // Set the user's role
        //   profilePicture: picture.data.url
        });
        await user.save();
      } else {
        // If the user already exists, update their role
        user.role = 'simpleUser'; // Set the user's role
        await user.save();
      }
  
      // Generate a JWT token for the user
      const payload = { subject: user._id, email };
      const jwtToken = jwt.sign(payload, 'secret');
  
      // Send the token and user information back to the client
      res.status(200).send({
        token: jwtToken,
        role: user.role,
        email: user.email,
        name: user.name,
        contact: user.phone,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ msg: 'Something went wrong' });
    }
  });


  // Define the Facebook Login route
router.post('/facebook-login', async (req, res) => {
    console.log(req.body);
    const { accessToken, userID } = req.body;
    try {
      // Get the user's information from Facebook
      const fields = 'id,name,email,picture.type(large)';
      const url = `https://graph.facebook.com/${userID}?fields=${fields}&access_token=${accessToken}`;
      const response = await axios.get(url);
      const { name, email, picture } = response.data;
  
      // Check if the user is already registered
      let user = await User.findOne({ email });
  
      if (!user) {
        // If the user is new, create a new user account
        user = new User({
          name,
          email,
          role: 'simpleUser', // Set the user's role
          profilePicture: picture.data.url
        });
        await user.save();
      } else {
        // If the user already exists, update their role
        user.role = 'simpleUser'; // Set the user's role
        await user.save();
      }
      
      // Generate a JWT token for the user
      const payload = { subject: user._id, email };
      const jwtToken = jwt.sign(payload, 'secret');
  
      // Send the token and user information back to the client
      res.status(200).send({
        token: jwtToken,
        role: user.role,
        email: user.email,
        name: user.name,
        contact: user.phone,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ msg: 'Something went wrong' });
    }
  });
  
  
// router.post('/register', async (req, res) => {
//     console.log(req.body);
//     let user = new User({
//         name: req.body.name,
//         email: req.body.email,
//         passwordHash: bcrypt.hashSync(req.body.password, 10),
//         phone: req.body.phone,
//         role: req.body.role,
//         isAdmin: req.body.isAdmin,
//         isEmployer: req.body.isEmployer,
//         street: req.body.street,
//         apartment: req.body.apartment,
//         zip: req.body.zip,
//         city: req.body.city,
//         country: req.body.country,
//     });
//     User.find({ email: req.body.email }, (err, users) => {
//         if (err) {
//             console.log('err in finding email ');
//             res.json({ msg: 'some error!' });
//         }
//         if (users.length != 0) {
//             console.log('already user with this email');
//             res.json({ msg: 'already user exist with this email!' });
//         }

//         else {
//             user.save((error, registeredUser) => {
//                 if (error) {
//                     console.log(error);
//                     res.json({ msg: "some error!" });
//                 }
//                 else {
//                     let payload = { subject: registeredUser._id }
//                     let token = jwt.sign(payload, 'secret')
//                     res.status(200).json({ token: token })
//                 }
//             })
//         }

//     });
//     // user = await user.save();

//     // if (!user) return res.status(400).send('the user cannot be created!');

//     // res.send(user);
// });

// Generate a unique user ID using a combination of ObjectId and crypto module
function generateUserId() {
  const id = new ObjectId();
  const md5sum = crypto.createHash('md5');
  md5sum.update(id.toString());
  return md5sum.digest('hex');
}

router.post('/register', async (req, res) => {
    console.log(req.body);
    let user = new User({
        //userId: generateUserId(),
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        role: req.body.role,
        isAdmin: req.body.isAdmin,
        isEmployer: req.body.isEmployer,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    User.find({ email: req.body.email }, (err, users) => {
        if (err) {
            console.log('err in finding email ');
            res.json({ msg: 'some error!' });
        }
        if (users.length != 0) {
            console.log('already user with this email');
            res.json({ msg: 'already user exist with this email!' });
        }

        else {
            user.save((error, registeredUser) => {
                if (error) {
                    console.log(error);
                    res.json({ msg: "some error!" });
                }
                else {
                    let payload = { subject: registeredUser._id }
                    let token = jwt.sign(payload, 'secret')
                    res.status(200).json({ token: token })
                }
            })
        }

    });
});
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      // Find the user by ID
      const user = await User.findById(req.params.id);
  
      // Update the user properties
      user.name = req.body.name;
      user.email = req.body.email;
      user.phone = req.body.phone;
      user.isAdmin = req.body.isAdmin;
      user.role = req.body.role;
      user.isEmployer = req.body.isEmployer;
      user.street = req.body.street;
      user.apartment = req.body.apartment;
      user.zip = req.body.zip;
      user.city = req.body.city;
      user.country = req.body.country;
  
      // Check if a new image file was uploaded
      if (req.file) {
        // Set the S3 bucket and file key
        const bucketName = '<YOUR_S3_BUCKET_NAME>';
        const fileKey = `user/${user._id}/profile.jpg`;
  
        // Upload the file to S3
        const params = {
          Bucket: process.env.AWS_BUCKET_SUDAKSHTA,
          Key: req.file.originalname,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        };
        const uploadResult = await s3.upload(params).promise();
  
        // Update the user image URL
        user.image = uploadResult.Location;
      }
  
      // Save the updated user to the database
      await user.save();
  
      res.status(200).json({ msg: 'User profile updated successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Internal server error' });
    }
  });
  


///Get Email

function getEmail(email) {
    Otp.find({ email: email }, (err, otps) => {

        if (err) {
            console.log("err in finding email ");
        }
        if (otps.length != 0) {
            console.log("yes in delete");
            Otp.deleteOne({ email: email }, (err) => {
                if (err)
                    console.log("err in delete");
            }
            )
        }
    })
}

//reset password

router.post('/Reset', async (req, res) => {
    User.find({ email: req.body.email }, async (err, users) => {
        if (err) {
            console.log('err in finding email ');
            res.json({ msg: 'some error!' });
        }
        if (users.length == 0) {
            console.log('user does not exist with this email at forgot password');
            res.json({ msg: 'user does not exist with this email' });
        } else {
            var email = req.body.email;
            var x = await getEmail(req.body.email);
            setTimeout(async function () {
                console.log('timeout (2min)');
                var y = await getEmail(email);
            }, 2 * 60000);
            var a = Math.floor(1000 + Math.random() * 9000);
            var otp = new Otp({
                otp: a,
                email: req.body.email
            });
            console.log('otp =', otp);
            try {
                doc = otp.save();
                sendMail(otp.email, otp.otp);
                res.status(201).json({ message: 'all ok otp has been send' });
            } catch (err) {
                res.json({ msg: 'some error!' });
            }
        }
    });
});
//reset password done
router.post('/reset-password-done', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: 'User does not exist with this email!!' });
    }

    const otps = await Otp.findOne({ email: req.body.email });
    if (!otps) {
      return res.status(400).json({ msg: 'Invalid request' });
    }

    const otp = otps.otp;
    if (otp != req.body.otp) {
      return res.status(400).json({ msg: 'Invalid Otp!!!' });
    }

    const passwordHash = User.hashPassword(req.body.password);
    const updatedUser = await User.findOneAndUpdate(
      { email: req.body.email },
      { passwordHash },
      { new: true }
    );

    // send password updated message to user by email
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'info@jobluu.com',
            pass: process.env.EMAILPASSWORD
        }
    });

    await transporter.sendMail({
      from: 'info@jobluu.com',
      to: user.email,
      subject: 'Password Updated Successfully',
      html: `<p>Dear ${user.name},</p>
              <p>Your password has been updated successfully.</p>`,
    });

    return res.json({ message: 'password updated!!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Something went wrong' });
  }
});

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({ success: true, message: 'the user is deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'user not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count);

    if (!userCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        userCount: userCount
    });
});


//verify token

router.post('/verifyToken', async (req, res) => {
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
})

// exports.verifyToken = (req, res, next) => {
//     if (!req.headers.authorization) {
//         return res.status(401).send("unauthorized req")
//     }
//     let token = req.headers.authorization.split(' ')[1]
//     // console.log(token);
//     if (token == 'null') {
//         return res.status(401).send("unauthorized req")
//     }
//     let payload = jwt.verify(token, 'secret')
//     if (!payload) {
//         return res.status(401).send("unauthorized req")
//     }
//     // console.log("in middleware");
//     // console.log(payload.subject);
//     // console.log(payload.email);
//     req.userId = payload.subject
//     req.email = payload.email;
//     // console.log(req.userId);
//     // console.log(req.email);
//     next()
// }

module.exports = router;
