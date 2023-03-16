const { SubCategory } = require('../models/sub_category');
const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const subCategoryList = await SubCategory.find().sort({ name: 1 });

    if (!subCategoryList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(subCategoryList);
})

router.get('/:id', async (req, res) => {
    const subCategory = await SubCategory.findById(req.params.id).sort({ name: 1 });

    if (!subCategory) {
        res.status(500).json({ message: 'The subCategory with the given ID was not found.' })
    }
    res.status(200).send(subCategory);
})



router.post('/addSubCategory', async (req, res) => {
    const check_sub = await SubCategory.find({ category_id: req.body.category_id });
    if (check_sub.length > 0) {

        let checking = false;
        for (let i = 0; i < check_sub.length; i++) {
            if (check_sub[i]['sub_category_id'].toLowerCase() === req.body.sub_category_id.toLowerCase()) {
                checking = true;
                break;
            }

        }
        if (checking === false) {
            let subCategory = new SubCategory({
                category_id: req.body.category_id,
                sub_category_id: req.body.sub_category_id,
                icon: req.body.icon,
                color: req.body.color
            })
            subCategory = await subCategory.save();
            if (!subCategory)
                return res.status(400).send('the Sub Category cannot be created!')

            res.send(subCategory);
        }

        else {
            return res.status(400).send('the Sub Category is all ready exits!')
        }
    }

    else {
        let subCategory = new SubCategory({
            category_id: req.body.category_id,
            sub_category_id: req.body.sub_category_id,
            icon: req.body.icon,
            color: req.body.color
        })
        subCategory = await subCategory.save();

        if (!subCategory)
            return res.status(400).send('the Sub Category cannot be created!')

        res.send(subCategory);
    }


})


router.put('/:id', async (req, res) => {
    const subCategory = await SubCategory.findByIdAndUpdate(
        req.params.id,
        {
            category_id: req.body.category_id,
            sub_category_id: req.body.sub_category_id,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true }
    )

    if (!subCategory)
        return res.status(400).send('the subCategory cannot be created!')

    res.send(subCategory);
})

router.delete('/:id', (req, res) => {
    SubCategory.findByIdAndRemove(req.params.id).then(subcategory => {
        if (subcategory) {
            return res.status(200).json({ success: true, message: 'the Sub Category is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "Sub Category not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})

module.exports = router;