import express from "express";
// import cors from "cors";
const port=3000;
const app=express();
app.use(express.json());
const userData=[
    {id: 101,
    name:"cm",
    email:"cmrj88@gmail.com"
    },
];
app.get("/",(req,res)=>{
res.status(200).json({
    message:"Welcome user",
    });   
});
app.get("/user",(req,res)=>{
try{
    res.status(200).json({message:"data recieved",userData});
    }
catch(err){
console.error("error",err.message);
}
});
app.post("/create",(req,res)=>{
    try{
    const{name,email}=req.body;
    const newUser={
        id:userData.length+1,
        name,
        email,
    };
    userData.push(newUser);
    res.status(201).json({message:"user created",newUser});
    } catch(err){
        console.error("error",err.message);
    }
});
app.delete()
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});