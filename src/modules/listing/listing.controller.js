import * as listingService from './listing.service.js';
import {asyncHandler} from '../../lib/util.js';
import {Validator} from '../../lib/validator.js';
import { createListingRequest,updateListingRequest } from './create-listing.request.js';
import {ValidationError} from '../../lib/error-definitions.js';
import { Listing } from './listing.schema.js';
import {v2 as cloudinary} from 'cloudinary';
import { NotFoundError, UnauthenticatedError } from '../../lib/error-definitions.js';
import { createNotification } from "../notifications/notification.service.js";
import {User} from "../auth/user.schema.js"
import { PropertyProvider } from '../propertyProvider/propertyProvider.schema.js';
import { ReportListing } from './listing.schema.js';
import { ReportListingRequest } from './create-listing.request.js';




export const createNewListing = asyncHandler(async (req, res) => {

  if (!req.propertyProvider || !req.propertyProvider.id) {
    throw new UnauthenticatedError("propertyProvider not authenticated");
  }

  const imageFiles = req.files.photos || [];
  const videoFiles = req.files.videos || [];

  if (imageFiles.length === 0) {
    throw new ValidationError("At least one photo must be uploaded.");
  }

  // Upload images
  const photoUrls = await Promise.all(
    imageFiles.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        ).end(file.buffer);
      })
    )
  );

  // Upload videos
  const videoUrls = await Promise.all(
    videoFiles.map(file =>
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "video" },
          async (error, result) => {
            if (error) return reject(error);

            // Duration check (max 60s)
            if (result.duration && result.duration > 60) {
              await cloudinary.uploader.destroy(result.public_id, { resource_type: "video" });
              return reject(new Error("Each video must be 60 seconds or less."));
            }

            resolve(result.secure_url);
          }
        ).end(file.buffer);
      })
    )
  );

  const validator = new Validator();
  const { errors, value } = validator.validate(createListingRequest, req.body);

  if (errors) throw new ValidationError("The request failed with the following errors.", errors);

  const listingPayload = {
    ...value,
    author: req.propertyProvider.id,
    listedBy: req.propertyProvider.id,
    username: req.propertyProvider.username,
    photos: photoUrls,
    videos: videoUrls
  };

  await listingService.createListing(listingPayload);

  res.status(201).json({
    success: true,
    message: "New listing created successfully",
    photos: photoUrls,
    videos: videoUrls
  });
});



export const fetchAllListings = asyncHandler(async (req, res) => {
  if (!req.propertyProvider || !req.propertyProvider.id) {
    throw new UnauthenticatedError("Not authenticated");
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filters = {
    listedBy: req.propertyProvider.id 
  };

  
  if (req.query.status) {
    filters.status = req.query.status;
  }

  
  const [listings, total] = await Promise.all([
    Listing.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Listing.countDocuments(filters)
  ]);

  const totalPage = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message: "Your listings retrieved successfully",
    data: {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPage
      }
    }
  });
});


export const fetchListing = asyncHandler(async(req, res) => 
{
    const {id} = req.params;
    const listing = await listingService.getListing(id);
    
    return res.json({
        success: true,
        message: 'listing retrieved',
        data: {
            listing
        }
    })

});


const extractPublicId = (url) => {
  if (!url) return null;

  // Example URL:
  // https://res.cloudinary.com/demo/image/upload/v123456789/listings/house.jpg

  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");

  if (uploadIndex === -1) return null;

  // Skip "upload" and version folder (v123...)
  const publicIdWithExt = parts
    .slice(uploadIndex + 2)
    .join("/");

  // Remove file extension
  return publicIdWithExt.replace(/\.[^/.]+$/, "");
};


export const deleteSingleListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.propertyProvider || !req.propertyProvider.id) {
    throw new UnauthenticatedError("Not authenticated");
  }

  const listing = await listingService.getListing(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  if (!listing.listedBy.equals(req.propertyProvider.id)) {
    throw new UnauthenticatedError("You are not authorized to delete this listing");
  }

  // Delete images
  if (Array.isArray(listing.photos)) {
    await Promise.all(
      listing.photos.map(async (url) => {
        const publicId = extractPublicId(url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
          });
        }
      })
    );
  }

  // Delete videos
  if (Array.isArray(listing.videos)) {
    await Promise.all(
      listing.videos.map(async (url) => {
        const publicId = extractPublicId(url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video"
          });
        }
      })
    );
  }

  await listingService.deleteListing(id);

  return res.status(200).json({
    success: true,
    message: "Listing and all associated media deleted successfully"
  });
});

export const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1️⃣ Auth check
  if (!req.propertyProvider || !req.propertyProvider.id) {
    throw new UnauthenticatedError("Not authenticated");
  }

  // 2️⃣ Fetch listing
  const listing = await listingService.getListing(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  // 3️⃣ Ownership check
  if (!listing.listedBy.equals(req.propertyProvider.id)) {
    throw new UnauthenticatedError("You are not authorized to update this listing");
  }

  // 4️⃣ Block media updates
  if (req.files && (req.files.photos || req.files.videos)) {
    throw new ValidationError("Images and videos cannot be updated");
  }

  // 5️⃣ Validate body (PARTIAL update)
  const validator = new Validator();
  const result = validator.validate(updateListingRequest, req.body);

  if (result.errors) {
    throw new ValidationError("Validation failed", result.errors);
  }

  // ✅ SAFELY DEFAULT VALUE
  const updatePayload = result.value || {};

  // 6️⃣ Prevent empty update
  if (Object.keys(updatePayload).length === 0) {
    throw new ValidationError("No valid fields provided for update");
  }

  // 7️⃣ Update listing
  const updatedListing = await Listing.findOneAndUpdate(
    { _id: id, listedBy: req.propertyProvider.id },
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Listing updated successfully",
    data: updatedListing
  });
});

/*export const toggleLikeListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1️⃣ Identify who is liking
  let likerId = null;
  let likerType = null;

  if (req.user?.id) {
    likerId = req.user.id;
    likerType = "user";
  } else if (req.propertyProvider?.id) {
    likerId = req.propertyProvider.id;
    likerType = "propertyProvider";
  } else {
    throw new UnauthenticatedError("Not authenticated");
  }

  // 2️⃣ Fetch listing
  const listing = await listingService.getListing(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  // 3️⃣ Check if already liked
  const alreadyLiked = listing.likes.find(
    like =>
      like.userId.toString() === likerId.toString() &&
      like.userType === likerType
  );

  if (alreadyLiked) {
    // 🔴 UNLIKE
    listing.likes = listing.likes.filter(
      like =>
        !(
          like.userId.toString() === likerId.toString() &&
          like.userType === likerType
        )
    );
  } else {
    // ❤️ LIKE
    listing.likes.push({
      userId: likerId,
      userType: likerType
    });
  }

  await listing.save();

  return res.status(200).json({
    success: true,
    message: alreadyLiked ? "Listing unliked" : "Listing liked",
    data: {
      likesCount: listing.likes.length,
      liked: !alreadyLiked
    }
  });
});*/


/*export const toggleLikeListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  
     //IDENTIFY LIKER
     
  let likerId = null;
  let likerType = null;

  if (req.user?.id) {
    likerId = req.user.id;
    likerType = "user"; // lowercase for Listing schema
  } else if (req.propertyProvider?.id) {
    likerId = req.propertyProvider.id;
    likerType = "propertyProvider"; // lowercase for Listing schema
  } else {
    throw new UnauthenticatedError("Not authenticated");
  }

  
     // FETCH LISTING
   
  const listing = await listingService.getListing(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  //CHECK IF ALREADY LIKED
  const alreadyLiked = listing.likes.find(
    like =>
      like.userId.toString() === likerId.toString() &&
      like.userType === likerType
  );

  if (alreadyLiked) {
    // 🔴 UNLIKE
    listing.likes = listing.likes.filter(
      like =>
        !(
          like.userId.toString() === likerId.toString() &&
          like.userType === likerType
        )
    );
  } else {
    // ❤️ LIKE
    listing.likes.push({
      userId: likerId,
      userType: likerType // lowercase for Listing schema
    });

    

    // ❌ Prevent self-like notification
    const isOwner =
      likerType === "propertyProvider" &&
      listing.listedBy.toString() === likerId.toString();

    if (!isOwner) {
      await createNotification({
        recipient: listing.listedBy,
        recipientModel: "PropertyProvider", // capitalized for Notification schema

        sender: likerId,
        senderModel: likerType === "user" ? "User" : "PropertyProvider", // mapped

        type: "LISTING_LIKED",

        entityId: listing._id,
        entityModel: "Listing",

        message: "someone liked your listing"
      });
    }
  }

  await listing.save();

  return res.status(200).json({
    success: true,
    message: alreadyLiked ? "Listing unliked" : "Listing liked",
    data: {
      likesCount: listing.likes.length,
      liked: !alreadyLiked
    }
  });
});*/



export const toggleLikeListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  
    //IDENTIFY LIKER
  let likerId = null;
  let likerType = null;
  let likerUsername = "Someone";

  if (req.user?._id) {
    //User
    likerId = req.user._id;
    likerType = "user";
    likerUsername = req.user.username;

    // If username not attached to req.user, fetch from DB
    if (!likerUsername) {
      const user = await User.findById(likerId).select("username");
      likerUsername = user?.username || "Someone";
    }

  } else if (req.propertyProvider?._id) {
    //PropertyProvider
    likerId = req.propertyProvider._id;
    likerType = "propertyProvider";
    likerUsername = req.propertyProvider.username;

    // If username not attached to req.propertyProvider, fetch from DB
    if (!likerUsername) {
      const provider = await PropertyProvider.findById(likerId).select("username");
      likerUsername = provider?.username || "Someone";
    }

  } else {
    throw new UnauthenticatedError("Not authenticated");
  }

  //FETCH LISTING
  const listing = await listingService.getListing(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  //CHECK IF ALREADY LIKED
  const alreadyLiked = listing.likes.find(
    like =>
      like.userId.toString() === likerId.toString() &&
      like.userType === likerType
  );

  if (alreadyLiked) {
    //UNLIKE
    listing.likes = listing.likes.filter(
      like =>
        !(
          like.userId.toString() === likerId.toString() &&
          like.userType === likerType
        )
    );
  } else {
    //LIKE
    listing.likes.push({
      userId: likerId,
      userType: likerType
    });

    //CREATE NOTIFICATION
    const isOwner =
      likerType === "propertyProvider" &&
      listing.listedBy.toString() === likerId.toString();

    if (!isOwner) {
      await createNotification({
        recipient: listing.listedBy,
        recipientModel: "PropertyProvider",

        sender: likerId,
        senderModel: likerType === "user" ? "User" : "PropertyProvider",

        type: "LISTING_LIKED",
        entityId: listing._id,
        entityModel: "Listing",

        message: `${likerUsername} liked your listing`
      });
    }
  }

  await listing.save();

  return res.status(200).json({
    success: true,
    message: alreadyLiked ? "Listing unliked" : "Listing liked",
    data: {
      likesCount: listing.likes.length,
      liked: !alreadyLiked
    }
  });
});





export const fetchPublicListings = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filters = {
    status: 'available',
  };

  if (req.query.location) filters.location = req.query.location;
  if (req.query.type) filters.type = req.query.type;

  const [listings, total] = await Promise.all([
    Listing.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Listing.countDocuments(filters)
  ]);

  res.json({
    success: true,
    data: {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

export const updateListingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // expected: "available" or "unavailable"

  if (!req.propertyProvider || !req.propertyProvider.id) {
    throw new UnauthenticatedError("Not authenticated");
  }

  const validStatuses = ["available", "unavailable"];
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const listing = await listingService.getListing(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  //Ownership check
  if (!listing.listedBy.equals(req.propertyProvider.id)) {
    throw new UnauthenticatedError("You are not authorized to update this listing");
  }

  listing.status = status;
  await listing.save();

  return res.status(200).json({
    success: true,
    message: `Listing status updated to "${status}" successfully`,
    data: {
      listingId: listing._id,
      status: listing.status
    }
  });
});

export const incrementListingViews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  res.json({
    success: true,
    data: {
      views: listing.views
    }
  });
});

//for homepage sections: "trending", "most viewed", "hot right now"
export const fetchPopularListings = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const listings = await Listing.find({ status: "available" })
    .sort({ views: -1, "likes.length": -1 })
    .limit(limit);

  res.json({
    success: true,
    data: listings
  });
});

//users can see all listings by a specific property provider (for public profile of the property provider)
export const fetchListingsBypropertyProvider = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  const listings = await Listing.find({
    listedBy: propertyProviderId,
    status: "available"
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: listings
  });
});

export const duplicateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.propertyProvider?.id) {
    throw new UnauthenticatedError("Not authenticated");
  }

  const listing = await listingService.getListing(id);
  if (!listing) throw new NotFoundError("Listing not found");

  if (!listing.listedBy.equals(req.propertyProvider.id)) {
    throw new UnauthenticatedError("you are not authorized to duplicate this listing");
  }

  const clone = listing.toObject();
  delete clone._id;

  clone.status = "unavailable";
  clone.createdAt = new Date();

  const newListing = await Listing.create(clone);

  res.status(201).json({
    success: true,
    message: "Listing duplicated successfully",
    data: newListing
  });
});

export const fetchUnavailableListings = asyncHandler(async (req, res) => {
  // 1️⃣ Auth check
  if (!req.propertyProvider || !req.propertyProvider.id) {
    throw new UnauthenticatedError("Not authenticated");
  }

  // 2️⃣ Pagination (optional but recommended)
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // 3️⃣ Query only THIS provider's unavailable listings
  const filters = {
    listedBy: req.propertyProvider.id,
    status: "unavailable"
  };

  const [listings, total] = await Promise.all([
    Listing.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Listing.countDocuments(filters)
  ]);

  res.status(200).json({
    success: true,
    message: "Your unavailable listings retrieved successfully",
    data: {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

export const reportListing = asyncHandler(async (req, res) => {
  const {id} = req.params //listingId

  //identify reporter
  let reporterId;
  let reporterModel;

  if (req.user?._id) {
    reporterId = req.user._id;
    reporterModel = "User";
  } else if (req.propertyProvider?._id) {
    reporterId = req.propertyProvider._id;
    reporterModel = "PropertyProvider";
  } else {
    throw new UnauthenticatedError("Not authenticated");
  }

  // validate request body
  const validator = new Validator();
  const {value, errors} = validator.validate(
    ReportListingRequest, req.body
  );

  if (errors) {
    throw new ValidationError("Invalid report data", errors);
  }

  //ensure listing exists
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  //prevent self-report 
  if (
    reporterModel === "PropertyProvider" &&
    listing.listedBy.toString() === reporterId.toString()
  ) {
    throw new ValidationError("you cannot report your own listing");
  }

  //create report 
  await ReportListing.create({
    listing:id,
    reporter: reporterId,
    reporterModel,
    reason: value.reason,
    description: value.description
  });
  return res.status(201).json({
    success:true,
    message: "Listing reported successfully, Our team will review it."
  });
});