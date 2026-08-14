import mongoose, { Schema, model } from "mongoose";

const ListingCommentReplySchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "ListingComment",
      required: true,
      index: true,
    },

    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      refPath: "authorModel",
      required: true,
    },

    authorModel: {
      type: String,
      enum: ["User", "PropertyProvider"],
      required: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    reply: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    replyLikeCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

ListingCommentReplySchema.index({
    comment: 1,
    createdAt: -1,
});

export const ListingCommentReply = model(
    "ListingCommentReply",
    ListingCommentReplySchema
);