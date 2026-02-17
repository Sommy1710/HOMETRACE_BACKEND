import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import { CreateAdminRequest, UpdateAdminRequest } from './create-admin.request.js';
import { AuthAdminRequest } from './auth-admin.request.js';
import { ValidationError } from '../../lib/error-definitions.js';
import {Admin} from './admin.schema.js';
import {sendEmail} from '../../lib/emailService.js';
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
import { ReportListing } from '../listing/listing.schema.js';
import { Listing } from './../listing/listing.schema.js';

function generateOTP() {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
};

export const createAdminAccount = asyncHandler(async (req, res) => {
    const validator = new Validator();

    const {value, errors} = validator.validate(CreateAdminRequest, req.body);
    if (errors)
        throw new ValidationError(
    'the request failed with the following errors', errors)

    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const adminData = {
        ...value,
        emailVerificationCode: otpCode,
        emailCodeExpiry: otpExpiry,
        isEmailVerified: false,
    };

    await authService.registerAdmin(adminData);

    try {
        await sendEmail({
            to: value.email,
            subject: 'Your verification code',
            html: `
                <p>Thank you for registering!</p>
                <p>Your verification code is: <strong>${otpCode}</strong></p>
                <p>This code expires in 10 minutes.</p>
            `
        });
        console.log('OTP email sent successfully.');
    } catch (err) {
        console.warn('Failed to send OTP email', err.message);
    }

    return res.status(201).json({
        message: 'Admin registered successfully. OTP sent to email.',
        data: {
            email: value.email,
            expiresAt: otpExpiry
        }
    });
});

export const verifyAdminEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({ message: 'Admin not found.' });
  }

  if (admin.isEmailVerified) {
    return res.status(400).json({ message: 'Email is already verified.' });
  }

  const now = new Date();
  if (admin.emailVerificationCode !== otp || now > admin.emailCodeExpiry) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  admin.isEmailVerified = true;
  admin.emailVerificationCode = null;
  admin.emailCodeExpiry = null;

  await admin.save();

  return res.status(200).json({ message: 'Email verified successfully.' });
});


export const authenticateAdmin = asyncHandler(async(req, res) => {
  const validator = new Validator();
  const {value, errors} = validator.validate(AuthAdminRequest, req.body);
  if (errors) throw new ValidationError('the request failed with the following errors', errors);

  const admin = await Admin.findOne({email: value.email});
  if (!admin) {
    return res.status(404).json({message: 'admin not found'});
  }
  if (!admin.isEmailVerified) {
    //generate new OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //10 minutes

    admin.emailVerificationCode = otpCode;
    admin.emailCodeExpiry = otpExpiry;
    await admin.save();

    try {
      await sendEmail({
        to: admin.email,
        subject: 'Verify your email',
        html: `
            <p>Your email is not verified.</p>
            <p>Your new verification code is: <strong>${otpCode}</strong></p>
            <p>This code expires in 10 minutes. </p>`
      });
      console.log('verification OTP resent');

    } catch (err) {
      console.warn('Failed to send verification email', err.message);
    }
    return res.status(403).json({
      message: 'Email not verified. A new OTP has been sent to your email.',
      data: {
        email: admin.email,
        expiresAt: otpExpiry
      }
    });
  }
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

export const fetchReportedListing = asyncHandler(async (req, res) => {

  //check autentication
  const requester = req.admin;
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all reported listings");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    ReportListing.find({status: "pending"})
    .populate("listing", "title status listedBy")
    .populate("reporter", "username email")
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit),
    ReportListing.countDocuments({status: "pending"})
  ]);

  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

export const reviewReport = asyncHandler(async (req, res) => {
  const requester = req.admin;
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all reported listings");
  }

  const {reportId} = req.params;

  const report = await ReportListing.findById(reportId);
  if (!report) {
    throw new NotFoundError("Report not found");
  }

  report.status = "reviewed";
  await report.save();

  res.json({
    success: true, 
    message: "Report marked as reviewed"
  });
});

export const resolveReport = asyncHandler(async (req, res) => {
  const requester = req.admin;
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all reported listings");
  }

  const {reportId} = req.params;

  const report = await ReportListing.findById(reportId);
  if (!report) {
    throw new NotFoundError("Report not found");
  }

  report.status = "resolved";
  await report.save();

  res.json({
    success: true,
    message: "Report resolved successfully"
  });
});

export const takeDownListing = asyncHandler(async (req, res) => {
  const requester = req.admin;
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all reported listings");
  }
  const {listingId} = req.params;
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new NotFoundError("Listing not found");
  }
  listing.status = "unavailable";
  listing.isDeleted = true;
  listing.deletedAt = new Date();

  await listing.save();

  res.json({
    success: true,
    message: "Listing has been taken down"
  });
});

export const banPropertyProvider = asyncHandler(async(req, res) => {
  const requester = req.admin;
  const isAdmin = ['admin'].includes(requester.role);


  if (!isAdmin) {
    throw new UnauthorizedError("You are not authorized to fetch all reported listings");
  }
  const {propertyProviderId} = req.params;
  const {reason} = req.body;

  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) {
    throw new NotFoundError("Property provider not found");
  }

  provider.isBanned = true;
  provider.bannedAt = new Date();
  provider.banReason = reason || "Violation of platform rules";

  await provider.save();

  // disable all their listing
  await Listing.updateMany(
    {listedBy: propertyProviderId},
    {status: "unavailable"}
  );

  res.json({
    success: true,
    message: "Property provider banned successfully"
  });
});