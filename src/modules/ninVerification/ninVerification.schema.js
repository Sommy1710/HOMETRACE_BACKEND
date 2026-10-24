import mongoose, { Schema, model } from "mongoose";

const NINVerificationSchema = new Schema(
  {
    propertyProvider: {
      type: Schema.Types.ObjectId,
      ref: "PropertyProvider",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
      required: true,
    },

    verificationReference: {
      type: String,
      default: null,
    },

    matchStatus: {
      type: String,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const NINVerification = model(
  "NINVerification",
  NINVerificationSchema
);