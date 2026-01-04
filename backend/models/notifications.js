const mongoose=require("mongoose");

const notificationSchema=new mongoose.Schema({
    recever:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        require:true,
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        require:true,
    },
    type: {
      type: String,
      enum: ["follow", "like", "comment"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
}, {timestamps:true});

const Notifications=mongoose.model("Notifications",notificationSchema);

module.exports=Notifications;