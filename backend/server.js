const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const cookieParser=require("cookie-parser");
dotenv.config();

const {connectDB} =require("./db/connectDB.js");

const authRoutes=require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

const app=express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("helllo world");
})

app.use("/auth",authRoutes);
app.use("/user",userRoutes);

const PORT=process.env.PORT;
app.listen(PORT,()=>{
    connectDB();
    console.log(`server running at port ${PORT}`);
});