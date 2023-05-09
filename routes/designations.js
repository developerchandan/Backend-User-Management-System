const {Designation} = require('../models/designation');
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

// router.get(`/`, async (req, res) =>{
//     const designationList = await Designation.find().sort({ name: 1 }).populate('industry department');

//     if(!designationList) {
//         res.status(500).json({success: false})
//     } 
//     res.status(200).send(designationList);
// })

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.Industries) {
        filter = { industry: req.query.Industries.split(',') };
    }

    const designationList = await Designation.find(filter).populate('industry department');

    if (!designationList) {
        res.status(500).json({ success: false });
    }
    res.send(designationList);
});


router.get('/:id', async(req,res)=>{
    const designation = await Designation.findById(req.params.id).sort({ name: 1 }).populate('industry department');

    if(!designation) {
        res.status(500).json({message: 'The designation with the given ID was not found.'})
    } 
    res.status(200).send(designation);
})



router.post('/add-designation', async (req, res) => {
    console.log(">", req.body);
    // const KRAsIDs = req.body.KRAs.map(KRA => KRA.Role);
    // const Role_responsibilitiesIDs = req.body.Role_responsibilities.map(KRA => KRA.Roles);
    let designation = new Designation({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
      KRAs: req.body.KRAs,
      KPIs:req.body.KPIs,
      roleAndResponsibility: req.body.roleAndResponsibility,
      SKB_Skill_InventoryBank:req.body.SKB_Skill_InventoryBank,
      industry:req.body.industry,
      department:req.body.department,
    });
    designation = await designation.save();
  
    if (!designation)
      return res.status(400).send('the designation cannot be created!');
  
    res.send(designation);
});

router.put('/:id',async (req, res)=> {
    const designation = await Designation.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            // icon: req.body.icon || designation.icon,
            color: req.body.color,
            KRAs: req.body.KRAs,
            KPIs: req.body.KPIs,
            roleAndResponsibility: req.body.roleAndResponsibility,
            SKB_Skill_InventoryBank: req.body.SKB_Skill_InventoryBank,
            industry: req.body.industry,
            department: req.body.department,
        },
        { new: true}
    )

    if(!designation)
    return res.status(400).send('the designation cannot be created!')

    res.send(designation);
})




router.delete('/:id', (req, res)=>{
    Designation.findByIdAndRemove(req.params.id).then(designation =>{
        if(designation) {
            return res.status(200).json({success: true, message: 'the designation is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "designation not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;