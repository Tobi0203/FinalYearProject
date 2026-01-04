const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const cookieParser=require("cookie-parser");
const app=express();

const http=require("http");
const server=http.createServer(app)
const {initSocket}=require("./socket/index.js")
const io=initSocket(server)

dotenv.config();

const {connectDB} =require("./db/connectDB.js");

const authRoutes=require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const postRoutes = require("./routes/postRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");

app.set("io", io);
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
app.use("/users",userRoutes);
app.use("/posts",postRoutes);
app.use("/notifications",notificationRoutes)



const PORT=process.env.PORT;
server.listen(PORT,()=>{
    connectDB();
    console.log(`server running at port ${PORT}`);
});