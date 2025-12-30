import * as listingService from './listing.service.js';
import {asyncHandler} from '../../lib/util.js';
import {Validator} from '../../lib/validator.js';
import { createListingRequest,updateListingRequest } from './create-listing.request.js';
import {ValidationError} from '../../lib/error-definitions.js';
import { Listing } from './listing.schema.js';
import {v2 as cloudinary} from 'cloudinary';
import { NotFoundError, UnauthenticatedError } from '../../lib/error-definitions.js';



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

export const toggleLikeListing = asyncHandler(async (req, res) => {
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
