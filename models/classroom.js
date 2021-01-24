const mongoose=require("mongoose");

const classroomSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    strength:{
        type:Number,
        required:true,
        trim:true,
        validate(value){
            if(value<0){
                throw new Error("Invalid Strength");
            }
        }
    },
    examno:{
       type:Number,
       required:true,
       default:0,
       trim:true
    },
    lastexam:{
      type:Date,
      trim:true
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Teacher'
    }
},{ timestamps:true })

const Classroom=mongoose.model("Classroom",classroomSchema);
module.exports=Classroom;