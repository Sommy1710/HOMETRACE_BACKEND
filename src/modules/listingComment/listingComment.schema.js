import mongoose, {model, Schema} from 'mongoose';

const ListingCommentSchema = new Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
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
  },

  comment: {
    type: String,
    maxlength: 1000,
    required: true,
  },

  commentLikeCount: {
    type: Number,
    default: 0,
  },

  replyCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const ListingComment = model("ListingComment", ListingCommentSchema);