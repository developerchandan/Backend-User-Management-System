const { Profile } = require('../models/profile');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');


const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(openaiConfig);
router.post('/api/chatgpt', async (req, res) => {
    console.log(req.body);
    const prompt = req.body.prompt;
    const model = req.body.model;
    const maxTokens = req.body.maxTokens || 1024; // Increase the default to 1024
    const temperature=req.body.temperature;
    const top_p=req.body.top_p;
    const frequency_penalty=req.body.frequency_penalty;
    const presence_penalty=req.body.presence_penalty;
  
    try {
      const response = await openai.createCompletion({
        model: model,
        prompt: prompt,
        max_tokens: maxTokens,
        temperature:temperature,
        top_p:top_p,
        frequency_penalty:frequency_penalty,
        presence_penalty:presence_penalty,
      });
    const generatedText = response.data.choices[0].text;
    console.log(generatedText); // Print the generated text to the console
    res.status(200).send(generatedText);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  });
  

router.get(`/`, async (req, res) => {
    const profile = await Profile.find();

    if (!profile) {
        res.status(500).json({ success: false });
    }
    res.status(200).send(profile);
});


  
//   router.post('/getuserdata', async (req, res) => {
//     try {
//       const email = req.body.email;
//       const profile = await Profile.findOne({ email: email });
  
//       if (!profile) return res.status(404).send('Profile not found');
  
//       res.send(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//     }
//   });
  
  router.post('/getuserdata', async (req, res) => {
    Profile.find({ email: req.body.email }).then((result) => {
        res.send({ data: result, status: 'success' })
    }).catch((e) => {
        res.send(e);
    })
});


router.post('/', async (req, res) => {
    let profile = new Profile({
        currentRole: req.body.currentRole,
        email: req.body.email,
        KRAs: req.body.KRAs,
        KPIs: req.body.KPIs,
        futureRole:req.body.futureRole,
        selfAssessment:req.body.selfAssessment
    });
    profile = await profile.save();

    if (!profile) return res.status(400).send('the profile cannot be created!');

    res.send(profile);
});

router.put('/:id', async (req, res) => {
    const profile = await Profile.findByIdAndUpdate(
        req.params.id,
        {
            currentRole: req.body.currentRole,
        email: req.body.email,
        KRAs: req.body.KRAs,
        KPIs: req.body.KPIs,
        futureRole:req.body.futureRole,
        selfAssessment:req.body.selfAssessment
        },
        { new: true }
    );

    if (!profile) return res.status(400).send('the profile cannot be created!');

    res.send(profile);
});

router.delete('/:id', (req, res) => {
    Contact.findByIdAndRemove(req.params.id)
        .then((contact) => {
            if (contact) {
                return res.status(200).json({ success: true, message: 'the contact is deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'contact not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});




module.exports = router;
