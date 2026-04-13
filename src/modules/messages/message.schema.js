import mongoose, { model, Schema } from 'mongoose';

const MessageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "senderModel"
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["User", "PropertyProvider"]
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "receiverModel"
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ["User", "PropertyProvider"]
  },
  content: { type: String },
  photos: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

// Ensure at least one of content or image is present
MessageSchema.pre("validate", function (next) {
  if (!this.content && (!this.photos || this.photos.length === 0)) {
    return next(new Error("Message must contain either text or an image."));
  }
  next();
});

export const Message = model("Message", MessageSchema);
