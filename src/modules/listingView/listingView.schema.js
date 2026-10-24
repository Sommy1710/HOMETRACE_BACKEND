import mongoose, { model, Schema } from "mongoose";

const ListingViewSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    // Identifies the viewer, whether logged in or anonymous.
    viewerKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// The same viewer can count only once per listing.
ListingViewSchema.index(
  { listing: 1, viewerKey: 1 },
  { unique: true }
);

export const ListingView = model("ListingView", ListingViewSchema);