import mongoose from "mongoose";
import {Listing} from "../listing/listing.schema.js";
import {ListingView} from "./listingView.schema.js";

export const recordListingView = async (req, listingId) => {
  // Identify a logged-in user or property provider.
  let viewerKey;

  if (req.user?.id || req.user?._id) {
    viewerKey = `User:${req.user.id ?? req.user._id}`;
  } else if (req.propertyProvider?.id || req.propertyProvider?._id) {
    viewerKey =
      `PropertyProvider:${
        req.propertyProvider.id ?? req.propertyProvider._id
      }`;
  } else {
    // For anonymous visitors, the frontend supplies a stable ID.
    const visitorId = req.get("x-visitor-id");

    if (visitorId && visitorId.length <= 100) {
      viewerKey = `Anonymous:${visitorId}`;
    } else {
      // Do not count unidentified visitors.
      return {
        counted: false,
        reason: "No viewer identity provided",
      };
    }
  }

  if (!mongoose.isValidObjectId(listingId)) {
    return null;
  }

  // First check whether the listing exists.
  const listingExists = await Listing.exists({ _id: listingId });

  if (!listingExists) {
    return null;
  }

  try {
    // The unique index prevents duplicate view records.
    await ListingView.create({
      listing: listingId,
      viewerKey,
    });

    // Only a newly recorded view increments the counter.
    const listing = await Listing.findByIdAndUpdate(
      listingId,
      { $inc: { views: 1 } },
      { new: true }
    );

    return {
      counted: true,
      views: listing.views,
    };
  } catch (error) {
    if (error.code === 11000) {
      // This viewer has already viewed this listing.
      const listing = await Listing.findById(listingId).select("views");

      return {
        counted: false,
        views: listing?.views ?? 0,
      };
    }

    throw error;
  }
};