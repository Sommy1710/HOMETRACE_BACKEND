import mongoose, { Schema, model } from "mongoose";

const ListingCommentReplyLikeSchema = new Schema(
  {
    reply: {
      type: Schema.Types.ObjectId,
      ref: "ListingCommentReply",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      refPath: "userModel",
      required: true,
    },

    userModel: {
      type: String,
      enum: ["User", "PropertyProvider"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ListingCommentReplyLikeSchema.index(
  {
    reply: 1,
    user: 1,
    userModel: 1,
  },
  {
    unique: true,
  }
);

ListingCommentReplyLikeSchema.index({
  reply: 1,
});

ListingCommentReplyLikeSchema.index({
  user: 1,
  userModel: 1,
});

export const ListingCommentReplyLike = model(
  "ListingCommentReplyLike",
  ListingCommentReplyLikeSchema
);