import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import { CreateAdminRequest, UpdateAdminRequest } from './create-admin.request.js';
import { AuthAdminRequest } from './auth-admin.request.js';
import { ValidationError } from '../../lib/error-definitions.js';
import {Admin} from './admin.schema.js';
//import { deleteAdminById } from './admin.service.js';
import { deleteUserById } from '../auth/user.service.js';
import { deletePropertyProviderById } from '../propertyProvider/propertyProvider.service.js';
//import config from '../../config/app.config.js';
import { UnauthorizedError, NotFoundError } from '../../lib/error-definitions.js';
//import validator from './../../../../speakeasy-troubleshooting/src/lib/input-validator';
import { User } from '../auth/user.schema.js';
import { PropertyProvider } from '../propertyProvider/propertyProvider.schema.js';
import * as listingService from '../listing/listing.service.js';
import { v2 as cloudinary } from "cloudinary";

export const createAdminAccount = asyncHandler(async (req, res) => {
    const validator = new Validator();

    const {value, errors} = validator.validate(CreateAdminRequest, req.body);
    if (errors)
        throw new ValidationError(
    'the request failed with the following errors', errors)
    await authService.registerAdmin(value);

    return res.status(201).json({
        success: true,
        message: 'admin registered successfully',
    });
});

export const authenticateAdmin = asyncHandler(async(req, res) =>
{
    const validator = new Validator();
    const {value, errors} = validator.validate(AuthAdminRequest, req.body);
    if (errors) throw new ValidationError('the request failed with the following errors', errors);
    const token = await authService.authenticateAdmin(value, req);
    res.cookie("authentication", token);
    return res.status(200).json({success: true, message: "admin successfully logged in"});

});

export const getAuthenticatedAdmin = asyncHandler(async(req, res) =>
{
    const admin = req.admin;
    return res.status(200).json({
        success: true,
        message: "admin found successfully",
        data: {
            admin
        },
    });
});


export const deleteUserAccountByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requester = req.admin;

  // Allow if requester is admin or super admin
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to delete this account");
  }

  const deleted = await deleteUserById(userId);

  res.status(200).json({
    success: true,
    message: "User account deleted successfully"
  });
});

export const deletePropertyProviderAccountByAdmin = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;
  const requester = req.admin;

  // Allow if requester is admin or super admin
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to delete this account");
  }

  const deleted = await deletePropertyProviderById(propertyProviderId);

  res.status(200).json({
    success: true,
    message: "Property provider account deleted successfully"
  });
});

// Helper function to extract publicId from a Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;

  // Remove query params if any
  const cleanUrl = url.split("?")[0];

  // Split path
  const parts = cleanUrl.split("/");
  const filename = parts.pop(); // get "abc123.jpg"
  const uploadIndex = parts.indexOf("upload");

  if (uploadIndex === -1 || !filename) return null;

  const folderPath = parts.slice(uploadIndex + 1).join("/"); // get folder path after /upload/
  return `${folderPath}/${filename.split(".")[0]}`; // remove file extension
};

export const deleteSingleListingByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requester = req.admin;

  const isAdmin = ['admin'].includes(requester.role);

  if (!isAdmin) {
    throw new UnauthorizedError("you are not authorized to delete this listing");
  }

  const listing = await listingService.getListing(id);
  if (!listing) {
    throw new NotFoundError("Listing not found");
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

export const listAllUsersByAdmin = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; //Default to page 1
    const limit = parseInt(req.query.limit) || 10 //default to 10 users
    const sortBy = req.query.sortBy || 'createdAt'; //Default sort field
    const sortOrder = req.query.order === 'desc' ? -1 : 1; //Ascending by default

    const requester = req.admin;

    const skip = (page - 1) * limit;

    // Allow if requester is admin or super admin
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all property providers");
  }

    const users = await User.find()
    .sort({ [sortBy]: sortOrder} )
    .skip(skip)
    .limit(limit);

    const totalUsers = await User.countDocuments();

    return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
        pagination: {
            total: totalUsers,
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit),
        },
    });
});



export const listAllPropertyProvidersByAdmin = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; //Default to page 1
    const limit = parseInt(req.query.limit) || 10 //default to 10 users
    const sortBy = req.query.sortBy || 'createdAt'; //Default sort field
    const sortOrder = req.query.order === 'desc' ? -1 : 1; //Ascending by default

    const requester = req.admin;

    const skip = (page - 1) * limit;

    // Allow if requester is admin or super admin
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all property providers");
  }

    const propertyProviders = await PropertyProvider.find()
    .sort({ [sortBy]: sortOrder} )
    .skip(skip)
    .limit(limit);

    const totalPropertyProviders = await PropertyProvider.countDocuments();

    return res.status(200).json({
        success: true,
        message: "Property providers retrieved successfully",
        data: propertyProviders,
        pagination: {
            total: totalPropertyProviders,
            page,
            limit,
            totalPages: Math.ceil(totalPropertyProviders / limit),
        },
    });
});


export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const requester = req.admin;

  const isSelf = requester.id === adminId;

  if (!isSelf) {
    throw new UnauthorizedError("You are not authorized to update this account");
  }

  const validator = new Validator();
  const { value, errors } = validator.validate(UpdateAdminRequest, req.body);

  if (errors) {
    throw new ValidationError('The request failed with the following errors', errors);
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    return res.status(404).json({ message: "Admin not found." });
  }

  // Update allowed fields
  Object.assign(admin, value);

  await admin.save();

  return res.status(200).json({
    success: true,
    message: "admin updated successfully",
    data: {
      admin
    }
  });
});

