import mongoose, { Schema, model } from "mongoose";

const ListingFavouriteSchema = new Schema(
  {
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

    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ListingFavouriteSchema.index({
  user: 1,
  userModel: 1,
  listing: 1,
}, {
  unique: true,
});

ListingFavouriteSchema.index({
  user: 1,
  userModel: 1,
});

ListingFavouriteSchema.index({
  listing: 1,
});

export const ListingFavourite = model(
  "ListingFavourite",
  ListingFavouriteSchema
);