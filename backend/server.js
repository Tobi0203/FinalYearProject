const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const cookieParser=require("cookie-parser");
dotenv.config();

const {connectDB} =require("./db/connectDB.js");

const authRoutes=require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const postRoutes = require("./routes/postRoutes.js");

const app=express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
    res.send("helllo world");
})

app.use("/auth",authRoutes);
app.use("/user",userRoutes);
app.use("/posts",postRoutes)

const PORT=process.env.PORT;
app.listen(PORT,()=>{
    connectDB();
    console.log(`server running at port ${PORT}`);
});