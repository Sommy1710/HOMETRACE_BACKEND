import { asyncHandler } from "../../lib/util.js";
import { UnauthenticatedError, NotFoundError } from "../../lib/error-definitions.js";
import {Listing} from "../listing/listing.schema.js";
import { ListingFavourite } from "./favourite.schema.js";

export const toggleFavouriteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.user && !req.propertyProvider) {
    throw new UnauthenticatedError("Authentication required.");
  }

  let accountId;
  let accountModel;

  if (req.user?.role === "propertyProvider") {
    accountId = req.user.id;
    accountModel = "PropertyProvider";
  } else if (req.user) {
    accountId = req.user.id;
    accountModel = "User";
  } else {
    accountId = req.propertyProvider.id;
    accountModel = "PropertyProvider";
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new NotFoundError("listing not found.");
  }

  const existingFavourite = await ListingFavourite.findOne({
    user: accountId,
    userModel: accountModel,
    listing: id,
  });

  if (existingFavourite) {
    await ListingFavourite.deleteOne({
      _id: existingFavourite._id,
    });

    return res.status(200).json({
      success: true,
      message: "listing removed from favourites.",
      favourited: false,
    });
  }

  await ListingFavourite.create({
    user: accountId,
    userModel: accountModel,
    listing: id,
  });

  return res.status(200).json({
    success: true,
    message: "listing added to favourites.",
    favourited: true,
  });
});



export const fetchFavouriteListings = asyncHandler(async (req, res) => {
  if (!req.user && !req.propertyProvider) {
    throw new UnauthenticatedError("Authentication required.");
  }

  let accountId;
  let accountModel;

  if (req.user?.role === "propertyProvider") {
    accountId = req.user.id;
    accountModel = "PropertyProvider";
  } else if (req.user) {
    accountId = req.user.id;
    accountModel = "User";
  } else {
    accountId = req.propertyProvider.id;
    accountModel = "PropertyProvider";
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {
    user: accountId,
    userModel: accountModel,
  };

  const [favourites, total] = await Promise.all([
    ListingFavourite.find(filter)
      .populate({
        path: "listing",
        select: `
          author
          description
          username
          title
          type
          photos
          videos
          price
          location
          geoLocation
          amenities
          status
          likeCount
          commentCount
          views
          createdAt
        `,
        populate: {
          path: "author",
          select: "username firstname lastname profilePhoto",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    ListingFavourite.countDocuments(filter),
  ]);

  const favouriteListings = favourites
    .filter((item) => item.listing)
    .map((item) => ({
      favouriteId: item._id,
      savedAt: item.createdAt,

      listing: {
        _id: item.listing._id,
        author: item.listing.author,
        description: item.listing.description,
        username: item.listing.username,
        title: item.listing.title,
        type: item.listing.type,
        photos: item.listing.photos,
        videos: item.listing.videos,
        price: item.listing.price,
        location: item.listing.location,
        geoLocation: item.listing.geoLocation,
        amenities: item.listing.amenities,
        status: item.listing.status,
        likeCount: item.listing.likeCount,
        commentCount: item.listing.commentCount,
        views: item.listing.views,
        createdAt: item.listing.createdAt,
      },
    }));

  return res.status(200).json({
    success: true,
    message: "Favourite listings retrieved successfully.",
    data: {
      favourites: favouriteListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    },
  });
});