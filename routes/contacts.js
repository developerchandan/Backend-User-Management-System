const { Contact } = require('../models/contact');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');


const openaiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(openaiConfig);
  
//   router.post('/api/chatgpt', async (req, res) => {
//     console.log(req.body);
//     const prompt = req.body.prompt;
//     const model = req.body.model;
//     const maxTokens = req.body.maxTokens;
//     const temperature=req.body.temperature;
//     const top_p=req.body.top_p;
//     const frequency_penalty=req.body.frequency_penalty;
//     const presence_penalty=req.body.presence_penalty;
  
//     const response = await openai.createCompletion({
//       model: model,
//       prompt: prompt,
//       max_tokens: maxTokens,
//       temperature:temperature,
//       top_p:top_p,
//       frequency_penalty:frequency_penalty,
//       presence_penalty:presence_penalty,
//     })
  
//     // res.send(response);
//     .then((response) => {
//         console.log(response);
//             res.status(200).send(response.data.choices[0].text);
//           }).catch((error) => {
//             res.status(500).send(error);
//           });
//   });

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
    const contact = await Contact.find();

    if (!contact) {
        res.status(500).json({ success: false });
    }
    res.status(200).send(contact);
});

router.get('/:id', async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(500).json({ message: 'The contact with the given ID was not found.' });
    }
    res.status(200).send(contact);
});

router.post('/', async (req, res) => {
    let contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        message: req.body.message
    });
    contact = await contact.save();

    if (!contact) return res.status(400).send('the contact cannot be created!');

    res.send(contact);
});

router.put('/:id', async (req, res) => {
    const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            message: req.body.message
        },
        { new: true }
    );

    if (!contact) return res.status(400).send('the contact cannot be created!');

    res.send(contact);
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
