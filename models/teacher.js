const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const Classroom=require("./classroom");

const teacherSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim:true
  },
  phoneNumber:{
    type:Number,
    required:true,
    trim:true,
    minlength:10
  },
  institution:{
    type:String,
    trim:true
  },
  email:{
      type:String,
      required:true,
      trim:true,
      unique:true,
      validate(value){
          if(!validator.isEmail(value)){
              throw new Error("Email invalid");
          }
      }
  },
  password:{
    type:String,
    required:true,
    trim:true,
    minlength:6
  },
  tokens:[{
      token:{
          type:String,
          required:true
      }
  }]
}, {timestamps:true} )

teacherSchema.pre('remove',async function(next){
    const teacher=this;
    const deleteClasses=await Classroom.findMany({teacher:teacher._id});
    deleteClasses.deleteMany();
    next();
})

teacherSchema.virtual('classroom',{
    ref:'Classroom',
    localField:'_id',
    foreignField:'teacher'
})

teacherSchema.methods.getPublicProfile=function(){
    const teacher=this;
    teacherObject={
        _id:teacher._id,
        name:teacher.name,
        phoneNumber:teacher.phoneNumber,
        email:teacher.email,
        institution:teacher.institution
    }
    return teacherObject;
}

teacherSchema.methods.generateAuthToken=async function(){
    const teacher=this;
    const token=await jwt.sign({_id:teacher._id.toString()},process.env.TOKEN);
    teacher.tokens=[];
    teacher.tokens=teacher.tokens.concat({token});
    await teacher.save();
    return token;
}
teacherSchema.statics.findByCredentials=async (email,password)=>{
    const teacher=await Teacher.findOne({email});
    if(!teacher){
        return null;
    }
    const isMatch=await bcrypt.compare(password,teacher.password);
    if(!isMatch){
        return null;
    }
    return teacher;
}
teacherSchema.pre('save',async function(next){
    const teacher=this;
    if(teacher.isModified('password')){
       teacher.password=await bcrypt.hash(teacher.password,10);
    }
    next();
})

const Teacher=mongoose.model("Teacher",teacherSchema);
module.exports=Teacher;