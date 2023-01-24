const { User } = require('../models/user');
var Otp = require('../models/otp');
// const { sendMail } = require('../mail/mail');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Router } = require('express');
var sendMail = require('../mail/mail')

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
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        isEmployer: req.body.isEmployer,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });
    user = await user.save();

    if (!user) return res.status(400).send('the user cannot be created!');

    res.send(user);
});

router.put('/:id', async (req, res) => {
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

// router.post('/user-login', async (req, res) => {
//     const user = await User.findOne({ email: req.body.email });
//     const secret = process.env.secret;
//     if (!user) {
//         return res.status(400).send('The user not found');
//     }

//     if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
//         const token = jwt.sign(
//             {
//                 userId: user.id,
//                 isAdmin: user.isAdmin
//             },
//             secret,
//             { expiresIn: '1d' }
//         );

//         res.status(200).send({
//             user: user.email,
//             role: user.role,
//             email: user.email,
//             token: token
//         });
//     } else {
//         res.status(400).send('password is wrong!');
//     }
// });

router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            console.log(err)
            res.json({ msg: "Somthing went wrong" });
        }
        else {
            if (!user) {
                res.json({ msg: 'Invalid Email!!' })
            }
            else {
                bcrypt.compare(req.body.password, user.passwordHash).then(match => {
                    if (match) {
                        console.log("login sucesssss");
                        let payload = { subject: user._id, email: user.email }
                        console.log("pay",payload)
                        let token = jwt.sign(payload, 'secret')
                        res.status(200).send({ token: token, role: user.role,email: user.email, name:user.name,contact:user.phone})
                    }
                    else {
                        console.log("incoreect passss");
                        res.json({ msg: 'Incorrect password!!' })
                    }
                }).catch(err => {
                    console.log("somthing wrong");
                    res.json({ msg: 'Somthing went wrong' })
                })
            }
        }
    })

})

router.post('/register', async (req, res) => {
    console.log(req.body);
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        // passwordHash: User.hashPassword(req.body.password),
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        role: req.body.role,
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
    // user = await user.save();

    // if (!user) return res.status(400).send('the user cannot be created!');

    // res.send(user);
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

router.post('/resestPasswordDone', async (req, res) => {
    User.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            console.log(err);
            res.json({ msg: 'Somthing went wrong' });
        } else {
            if (!user) {
                res.json({ msg: 'User does not exist with this email!!' });
            } else {
                Otp.findOne({ email: req.body.email }, async (err, otps) => {
                    if (err) {
                        res.json({ msg: 'Somthing went wrong' });
                    }
                    if (!otps) {
                        res.json({ msg: 'Somthing went wrong' });
                    } else {
                        var otp = otps.otp;
                        if (otp != req.body.otp) {
                            res.json({ msg: 'Invalid Otp!!!' });
                        } else {
                            var p = User.hashPassword(req.body.password);
                            var x = await getEmail(req.body.email);
                            User.updateOne(
                                { email: req.body.email },
                                { passwordHash: p },
                                function (err, user) {
                                    console.log(1);
                                    if (err) {
                                        console.log(err);
                                        res.json({ msg: 'Somthing went wrong' });
                                    } else {
                                        res.json({ message: 'password updated!!' });
                                    }
                                }
                            );
                        }
                    }
                });
            }
        }
    });
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
