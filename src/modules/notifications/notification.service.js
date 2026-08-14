import {Notification} from "./notification.schema.js";
import {io} from "../../bootstrap/server.js";

/*export const createNotification = async ({
    recipient,
    recipientModel,
    sender,
    senderModel,
    type,
    entityId,
    entityModel,
    message
}) => {
    return Notification.create({
        recipient,
        recipientModel,
        sender,
        senderModel,
        type,
        entityId,
        entityModel,
        message
    });
};*/

export const createNotification = async ({
  recipient,
  recipientModel,
  sender,
  senderModel,
  type,
  entityId,
  entityModel,
  message
}) => {

  // save notification in database
  const notification = await Notification.create({
    recipient,
    recipientModel,
    sender,
    senderModel,
    type,
    entityId,
    entityModel,
    message
  });

  // emit real-time notification
  io.to(recipient.toString()).emit("newNotification", {
    _id: notification._id,
    type: notification.type,
    message: notification.message,
    entityId: notification.entityId,
    entityModel: notification.entityModel,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  });

  return notification;
};