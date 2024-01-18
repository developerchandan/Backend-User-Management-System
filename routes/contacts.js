const { Contact } = require('../models/contact');
const { Newsletter } = require('../models/newsletter');
const express = require('express');
const router = express.Router();
const axios = require('axios');

const {OpenAIApi, Configuration} = require('openai');
const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});

// Rest of your code
router.post('/generate-text', async (req, res) => {
  try {
    const { model, prompt, max_tokens } = req.body;
    console.log(req.body);

    const openai = new OpenAIApi(configuration);
    console.log(process.env.OPENAI_API_KEY);

    const response = await openai.createCompletion({
      model: model,
      prompt: prompt,
      max_tokens: max_tokens,
      temperature: 0.5,
    });

    console.log("OpenAI API Response:", response.data);
    
    const generatedText = response.data.choices[0].text;
    console.log("Generated Text:", generatedText);

    res.status(200).json({ text: generatedText });
  } catch (error) {
    console.error('OpenAI API Error:', error.response.data.error);
    res.status(400).json({ error: error.response.data.error.message });
  }
});

router.post('/api/chatgpt', async (req, res) => {
    console.log(req.body);
    const prompt = req.body.prompt;
    const model = req.body.model;
    const maxTokens = req.body.maxTokens || 1024; 
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
        contact: req.body.contact,
        message: req.body.message,
        company:req.body.company,
        isPrivacyPolicy:req.body.isPrivacyPolicy
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
            contact: req.body.contact,
            message: req.body.message,
            company:req.body.company,
            isPrivacyPolicy:req.body.isPrivacyPolicy
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


// Subscribe our newsletter
router.get('/check-subscription/:newsletter', async (req, res) => {
    try {
      const newsletter = await Newsletter.findOne({ newsletter: req.params.newsletter });
      if (newsletter) {
        // User is already subscribed
        res.send({ subscribed: true });
      } else {
        // User is not subscribed
        res.send({ subscribed: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Failed to check subscription.');
    }
  });

  // Check if a user is subscribed to the newsletter
router.post('/add-newsletter', async (req, res) => {
    let existingNewsletter = await Newsletter.findOne({ newsletter: req.body.newsletter });
    if (existingNewsletter) {
        return res.status(400).send('You have already subscribed to the newsletter.');
    }

    let newsletter = new Newsletter({
        newsletter: req.body.newsletter
    });
    newsletter = await newsletter.save();

    if (!newsletter) return res.status(400).send('The newsletter cannot be created!');

    res.send(newsletter);
});





module.exports = router;
