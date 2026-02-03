import { Notification } from "./notification.schema.js";
import {asyncHandler} from '../../lib/util.js';


export const getMyNotifications = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id || !user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await Notification.find({
      recipient: user._id,
      recipientModel: user.role === "user" ? "User" : "PropertyProvider"
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Notification.findByIdAndUpdate(id, {
    isRead: true
  });

  res.json({ success: true });
});
