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
      enum: ["LISTING_LIKED", "NEW_FOLLOWER"],
      required: true
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },

    entityModel: {
      type: String,
      enum: ["Listing", "PropertyProvider"],
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

