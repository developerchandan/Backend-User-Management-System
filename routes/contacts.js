const { Contact } = require('../models/contact');
const express = require('express');
const router = express.Router();

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
