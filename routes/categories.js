const {Category} = require('../models/category');
const express = require('express');
const { Result } = require('../models/result');
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();



// router.get('/', async (req, res) => {
//     const { strength_id } = req.query;
    
//     // If strength_id is provided, use it to filter the results
//     let categoryList;
//     if (strength_id) {
//       categoryList = await Category.find({
//         'subCategory.subCategoryList.strength_id': strength_id
//       }).sort({ name: 1 }).populate({
//         path: 'subCategory.subCategoryList.strength_id',
//         model: 'HumanR',
//       });
//     } else {
//       // Otherwise, return all categories
//       categoryList = await Category.find().sort({ name: 1 }).populate({
//         path: 'subCategory.subCategoryList.strength_id',
//         model: 'HumanR',
//       });
//     }
  
//     if (!categoryList) {
//       res.status(500).json({ success: false });
//     } 
  
//     res.status(200).send(categoryList);
//   });
  

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find().sort({ name: 1 }).populate({
        path: 'subCategory.subCategoryList.strength_id',
        model: 'HumanR',
    });

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})

router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id).sort({ name: 1 });

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).send(category);
})



router.post('/', async (req,res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if(!category)
    return res.status(400).send('the category cannot be created!')

    res.send(category);
})


router.put('/:id',async (req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!category)
    return res.status(400).send('the category cannot be created!')

    res.send(category);
})


//@SubCategory Put OperationS;

router.put('/subcategory/:id', jsonParser, (req, res) => {
    console.log(req.body);
    Category.findOneAndUpdate({ _id: req.params.id }, {
        $push: {

            subCategory: {
                subCategoryName: req.body.subCategoryName,
                subCategoryIcon: req.body.subCategoryIcon,
                
            }

        }
    },
        {new: true}
    ).then((Result) => {
        res.send(Result);
    })
        .catch((error) => {
            res.send(error);
        })

})

router.put('/subcategoryList/:id', jsonParser, (req, res) => {
    console.log(req.body);
    Category.findOneAndUpdate({ _id: req.params.id }, {
        $push: {

            subCategoryList: {
                strength_id: req.body.strength_id,
                category: req.body.category,
                subCategory:req.body.subCategory
                
            }

        }
    },
        {new: true}
    ).then((Result) => {
        res.send(Result);
    })
        .catch((error) => {
            res.send(error);
        })

})

router.put('/update_subcategory_list/:id', jsonParser, (req, res) => {
    console.log(req.body);

    Category.findOneAndUpdate({"subCategory._id": req.params.id }, {
        $push: {

            "subCategory.$.subCategoryList": {
                strength_id: req.body.strength_id,
            }

        }
    },
        {new: true}
    ).then((Result) => {
        res.send(Result);
    })
        .catch((error) => {
            res.send(error);
        })

});


router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category) {
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;