import mongoose, { Schema, model } from "mongoose";

const ListingCommentLikeSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "ListingComment",
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

ListingCommentLikeSchema.index(
  {
    comment: 1,
    user: 1,
    userModel: 1,
  },
  {
    unique: true,
  }
);

ListingCommentLikeSchema.index({
  comment: 1,
});

ListingCommentLikeSchema.index({
  user: 1,
  userModel: 1,
});

export const ListingCommentLike = model(
  "ListingCommentLike",
  ListingCommentLikeSchema
);