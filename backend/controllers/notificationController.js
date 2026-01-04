const Notification = require("../models/notifications");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = { getNotifications ,markAllAsRead};
