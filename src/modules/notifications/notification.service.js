import {Notification} from "./notification.schema.js";

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
};