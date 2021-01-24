const express=require("express");
const router=new express.Router();
const { check , validationResult } = require('express-validator');

const Teacher=require("../models/teacher");
const authentication=require("../utils/authentication");

//create teacher registration ...
router.post("/",
   [
      check('name','Please provide a name').not().isEmpty(),
      check('email','Please provide a valid email').isEmail(),
      check('password','Please provide a 6 character long password').isLength({ min : 6 })
   ],
   async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ error : errors.array() })
    }
    try {
      const teacherCheck = await Teacher.findOne({email:req.body.email});

      if(teacherCheck){
         return res.status(400).json({ msg : 'A teacher already exists with this email' });
      }

      const teacher = new Teacher({
        name:req.body.name,
        phoneNumber:req.body.phoneNumber,
        institution:req.body.institution,
        email:req.body.email,
        password:req.body.password,
    })
    await teacher.save();
    const token=await teacher.generateAuthToken();
    res.status(201).json({teacher:teacher,token});
} catch (error) {
     res.status(400).json(error);
   }
})
//login to teacher's profile...
router.post("/log_in",[
     check('email','Please Provide a valid Email').isEmail(),
     check('password','Please Provide a 6 character long password').exists()
    ],
    async (req,res)=>{
    const errors  =  validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ error : errors.array() });
    }
    try {
     const teacher=await Teacher.findByCredentials(req.body.email,req.body.password);
     if(!teacher){
         res.status(400).json({msg:"Invalid credentials"});
     }
     const token=await teacher.generateAuthToken();
     res.status(200).json({teacher:teacher,token});
    } catch (error) {
      res.status(400).send(error);
    }
 })
 //log out 
router.get("/logout",authentication,async (req,res)=>{
  try {
      const teacher= req.teacher;
      teacher.tokens = await teacher.tokens.filter((token)=>token.token!=req.token);
      await teacher.save();
      res.status(200).json({msg:'Successfully logged out'});
  } catch (error) {
      res.status(500).json({ msg : error.msg });
  }
})
//get teacher details 
router.get("/me",authentication,async (req,res)=>{
    try {
    const teacher=req.teacher;
    res.status(200).json({teacher:teacher.getPublicProfile()});
    } catch (error) {
     res.status(500).json({ msg : 'Server Error' });   
    }
})
//edit teacher details 
router.patch("/edit/me",authentication,async (req,res)=>{
  try {
    const updates=Object.keys(req.body);
    const allowedUpdates=["name","phoneNumber","institution","email","password"];
    const isValid=updates.every((update)=>allowedUpdates.includes(update));

    if(!isValid){
        res.status(400).json({ msg :"Invalid Updates" });   
    }
    const teacher=req.teacher;
    updates.forEach((update)=>teacher[update]=req.body[update]);
    await teacher.save();
    res.status(200).json({teacher:teacher.getPublicProfile()});   
  } catch (error) {
    res.status(500).json( { msg : 'Internal Server Errors' });
  }
})
//delete teacher
router.delete("/me",authentication,async (req,res)=>{
    try {
      const teacher=req.teacher;
      await teacher.remove();
      res.status(200).json( {teacher:teacher.getPublicProfile()});
    } catch (error) {
        res.status(500).json( { msg : 'Internal Server Error' });
    }
})

module.exports=router;