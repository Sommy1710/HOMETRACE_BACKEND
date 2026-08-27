import mongoose, { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel"
    },

    recipientModel: {
      type: String,
      enum: ["User", "PropertyProvider"],
      required: true
    },

    sender: {
      type: Schema.Types.ObjectId,
      refPath: "senderModel"
    },

    senderModel: {
      type: String,
      enum: ["User", "PropertyProvider"]
    },

    type: {
      type: String,
      enum: ["LISTING_LIKED", "NEW_FOLLOWER", "COMMENTED_ON_LISTING", "COMMENT_LIKED", "COMMENT_REPLIED", "REPLY_LIKED"],
      required: true
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },

    entityModel: {
      type: String,
      enum: ["Listing", "PropertyProvider", "User", "ListingComment"],
      required: true
    },

    message: {
      type: String,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Notification = model("Notification", NotificationSchema);

