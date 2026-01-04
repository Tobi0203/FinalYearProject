const express=require("express");
const { verifyUser } = require("../middileware/verifyUser");
const { getNotifications, markAllAsRead } = require("../controllers/notificationController");
const notificationRoutes=express.Router();

notificationRoutes.get("/",verifyUser,getNotifications);
notificationRoutes.put("/mark-read", verifyUser, markAllAsRead)

module.exports=notificationRoutes;