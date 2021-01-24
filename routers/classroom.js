const express = require("express");
const router = new express.Router();
const Classroom =require("../models/classroom");
const authentication = require("../utils/authentication");
const { check , validationResult } = require("express-validator");

//create classroom
router.post("/",authentication,
    [
      check('name','Please provide a name').not().isEmpty(),
      check('strength','Please provide a valid number').not().isEmpty()
    ]
  ,async (req,res)=>{
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     return res.status(400).json({error : errors.array()})
   }
   try {
    const classroom = new Classroom({
        ...req.body,
        teacher:req.teacher._id
    });
    await classroom.save();
    res.status(201).json(classroom);
   } catch (error) {
     console.log(error);
     res.status(500).json({error : 'Server Error' });
   }
})
//get all classroom details
router.get("/",authentication,async (req,res)=>{
  try {
  await req.teacher.populate('classroom').execPopulate();
  const classrooms = await req.teacher.classroom.sort();
  if(!classrooms){
      res.status(400).json({msg:"No classroom to show"});
  }
  res.status(200).json( classrooms );
  } catch (error) {
   res.status(500).json({ msg : 'Server Error'});   
  }
})
//get specific classroom detail for teacher to see
router.get("/:_id",authentication,async (req,res)=>{
    try {
    const _id=req.params._id;
    const classroom=await Classroom.findById(_id);
    if(!classroom){
        res.status(400).json({msg:"Invalid Id"});
    }
    await classroom.populate('exam').execPopulate();
    res.status(200).json(classroom);
    } catch (error) {
     res.status(500).json({ msg : 'Server Error'});   
    }
})

//edit basic details of classroom
router.patch("/edit/:_id",authentication,async (req,res)=>{
  try {
    const updates=Object.keys(req.body);
    const allowedUpdates=["name","strength","examno","lastexam"];
    const isValid=updates.every((update)=>allowedUpdates.includes(update));

    if(!isValid){
        res.status(400).json({msg:"Invalid Updates"});   
    }
    const _id=req.params._id;
    const classroom=await Classroom.findById(_id);
    if(!classroom){
        res.status(400).json({msg:"Invalid Id"});
    }
    updates.forEach((update)=>classroom[update]=req.body[update]);
    await classroom.save();
    res.status(200).json(classroom);   
  } catch (error) {
    res.status(500).json({msg:'Server Error'});
  }
})
//delete classroom
router.delete("/:_id",authentication,async (req,res)=>{
    try {
      const _id=req.params._id;
      const classroom=await Classroom.findById(_id);
      if(!classroom){
        res.status(400).json({msg:"Invalid Id"});
     }
      await classroom.remove();
      res.status(200).json({ msg : 'Classroom Deleted'});
    } catch (error) {
      res.status(500).json({ msg:'Server Error' });
    }
})

module.exports=router;