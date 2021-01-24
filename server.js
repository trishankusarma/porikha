const express = require("express");
const app=express();
const mongoose=require("mongoose");
const classroomRouter=require("./routers/classroom");
const teacherRouter=require("./routers/teacher");
require("dotenv").config();

const PORT=process.env.PORT;

app.use(express.urlencoded({extended:false}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useCreateIndex:true,
    useFindAndModify:true
})
const db=mongoose.connection;
db.on("error",(error)=>{
    console.error(error);
    process.exit(1);
})
db.once("open",()=>{
    console.log("Connected to MongoDB database");
})

app.use('/classroom',classroomRouter);
app.use("/teacher",teacherRouter);

//Serve the static assets if in production
if(process.env.NODE_ENV === 'production'){
  //set static folder
  app.use(express.static('client/build'));

  app.get('*',(req,res)=>{
      res.sendFile(path.resolve(__dirname, ' client ',' build ','index.html'));
  });
}

app.listen(PORT,()=>{
    console.log(`Port running at ${PORT}`);
})