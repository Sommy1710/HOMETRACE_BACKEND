import { Notification } from "./notification.schema.js";
import { asyncHandler } from "../../lib/util.js";
import { NotFoundError, UnauthorizedError } from "../../lib/error-definitions.js";


export const getMyNotifications = asyncHandler(async (req, res) => {

    const user = req.user;

    if (!user || !user._id || !user.role) {
        throw new UnauthorizedError("Unauthorized.");
    }


    const recipientModel =
        user.role === "user"
            ? "User"
            : "PropertyProvider";


    const notifications = await Notification.find({
        recipient: user._id,
        recipientModel
    })
        .sort({ createdAt: -1 })
        .lean();


    return res.status(200).json({
        success: true,
        message: "Notifications fetched successfully.",
        total: notifications.length,
        notifications
    });
});



export const markNotificationAsRead = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const user = req.user;

    if (!user || !user._id || !user.role) {
        throw new UnauthorizedError("Unauthorized.");
    }


    const recipientModel =
        user.role === "user"
            ? "User"
            : "PropertyProvider";


    const notification = await Notification.findOneAndUpdate(
        {
            _id: id,

            // Make sure this notification belongs
            // to the authenticated user
            recipient: user._id,
            recipientModel
        },
        {
            isRead: true
        },
        {
            new: true
        }
    );


    if (!notification) {
        throw new NotFoundError(
            "Notification not found."
        );
    }


    return res.status(200).json({
        success: true,
        message: "Notification marked as read.",
        notification
    });
});