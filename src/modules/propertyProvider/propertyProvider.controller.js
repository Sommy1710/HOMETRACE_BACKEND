//import sanitize from 'mongo-sanitize';
import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import {CreatePropertyProviderRequest, UpdatePropertyProviderRequest} from './create-propertyProvider.request.js';
import { AuthPropertyProviderRequest } from './auth-propertyProvider.request.js';
import { ValidationError } from '../../lib/error-definitions.js';
//import config from '../../config/app.config.js';
import {PropertyProvider} from './propertyProvider.schema.js';
import {v2 as cloudinary} from 'cloudinary';
import {sendEmail} from '../../lib/emailService.js';
import { deletePropertyProviderById } from './propertyProvider.service.js';
import config from '../../config/app.config.js';
import { UnauthorizedError } from '../../lib/error-definitions.js';
import crypto from 'crypto';




//function to generate a 4-digit OTP

function generateOTP() {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPropertyProviderAccount = asyncHandler(async (req, res) => {
    const validator = new Validator();
    const { value, errors } = validator.validate(CreatePropertyProviderRequest, req.body);

    if (errors) {
        throw new ValidationError(
            'The request failed with the following errors',
            errors
        );
    }

    let profilePhotoUrl = '';

    if (req.file) {
        profilePhotoUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(new Error('Image upload failed'));
                    resolve(result.secure_url);
                }
            );
            uploadStream.end(req.file.buffer);
        });
    }

    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const propertyProviderData = {
        ...value,
        profilePhoto: profilePhotoUrl,
        emailVerificationCode: otpCode,
        emailCodeExpiry: otpExpiry,
        isEmailVerified: false,
        isVerified: false,
    };

    await authService.registerPropertyProvider(propertyProviderData);

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
        message: 'Property provider registered successfully. OTP sent to email.',
        data: {
            email: value.email,
            expiresAt: otpExpiry
        }
    });
});



export const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const propertyProvider = await PropertyProvider.findOne({ email });
  if (!propertyProvider) {
    return res.status(404).json({ message: 'Property provider not found.' });
  }

  if (propertyProvider.isEmailVerified) {
    return res.status(400).json({ message: 'Email is already verified.' });
  }

  const now = new Date();
  if (propertyProvider.emailVerificationCode !== otp || now > propertyProvider.emailCodeExpiry) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  propertyProvider.isEmailVerified = true;
  propertyProvider.emailVerificationCode = null;
  propertyProvider.emailCodeExpiry = null;

  await propertyProvider.save();

  return res.status(200).json({ message: 'Email verified successfully.' });
});

export const authenticatePropertyProvider = asyncHandler(async(req, res) => {
  const validator = new Validator();
  const {value, errors} = validator.validate(AuthPropertyProviderRequest, req.body);
  if (errors) throw new ValidationError('the request failed with the following errors', errors);

  const propertyProvider = await PropertyProvider.findOne({email: value.email});
  if (!propertyProvider) {
    return res.status(404).json({message: 'Property provider not found'});
  }
  if (!propertyProvider.isEmailVerified) {
    //generate new OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //10 minutes

    propertyProvider.emailVerificationCode = otpCode;
    propertyProvider.emailCodeExpiry = otpExpiry;
    await propertyProvider.save();

    try {
      await sendEmail({
        to: propertyProvider.email,
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
        email: user.email,
        expiresAt: otpExpiry
      }
    });
  }
  const token = await authService.authenticatePropertyProvider(value, req);
  res.cookie("authentication", token);
  return res.status(200).json({success: true, message: "Property provider successfully logged in"});

});

export const getAuthenticatedPropertyProvider = asyncHandler(async(req, res) =>
{
    const propertyProvider = req.propertyProvider;
    return res.status(200).json({
        success: true,
        message: "Property provider found successfully",
        data: {
            propertyProvider
        },
    });
});

export const deletePropertyProviderAccount = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;
  const requester = req.propertyProvider;

  // Allow if requester is admin or super admin
  const isAdmin = ['admin'].includes(requester.role);

  //  Allow if requester is deleting their own account
  const isSelf = requester.id === propertyProviderId;

  if (!isAdmin && !isSelf) {
    throw new UnauthorizedError("You are not authorized to delete this account");
  }

  const deleted = await deletePropertyProviderById(propertyProviderId);

  res.status(200).json({
    success: true,
    message: "Property provider account deleted successfully"
  });
});

export const logoutPropertyProvider = asyncHandler(async (req, res) => {
  res.clearCookie('authentication', {
    httpOnly: true,
    secure: config.environment === 'production',
    sameSite: 'Strict'
  });

  return res.status(200).json({ success: true, message: 'Property provider successfully logged out' });
});

export const deletePropertyProviderProfilePhoto = asyncHandler(async (req, res) => {
  const requester = req.propertyProvider;

  // Ensure the requester is authenticated
  if (!requester) {
    throw new UnauthorizedError("You must be logged in to delete your profile photo.");
  }

  const propertyProvider = await PropertyProvider.findById(requester.id);
  if (!propertyProvider) {
    return res.status(404).json({ message: "Property provider not found." });
  }

  // Check if profile photo exists
  if (!propertyProvider.profilePhoto) {
    return res.status(400).json({ message: "No profile photo to delete." });
  }

  // Extract public_id from the Cloudinary URL
  const publicIdMatch = propertyProvider.profilePhoto.match(/\/([^/]+)\.[a-z]+$/);
  if (!publicIdMatch) {
    return res.status(400).json({ message: "Invalid profile photo URL." });
  }

  const publicId = publicIdMatch[1];

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    propertyProvider.profilePhoto = null;
    await propertyProvider.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo deleted successfully."
    });
  } catch (error) {
    console.error("Failed to delete profile photo:", error.message);
    return res.status(500).json({ message: "Failed to delete profile photo." });
  }
});


export const updatePropertyProviderAccount = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;
  const requester = req.propertyProvider;

  const isAdmin = ['admin'].includes(requester.role);
  const isSelf = requester.id === propertyProviderId;

  if (!isAdmin && !isSelf) {
    throw new UnauthorizedError("You are not authorized to update this account");
  }

  const validator = new Validator();
  const { value, errors } = validator.validate(UpdatePropertyProviderRequest, req.body);

  if (errors) {
    throw new ValidationError('The request failed with the following errors', errors);
  }

  const propertyProvider = await PropertyProvider.findById(propertyProviderId);
  if (!propertyProvider) {
    return res.status(404).json({ message: "Property provider not found." });
  }

  // Update allowed fields
  Object.assign(propertyProvider, value);

  // Handle profile photo update
  if (req.file) {
    // Delete old photo if exists
    if (propertyProvider.profilePhoto) {
      const publicIdMatch = propertyProvider.profilePhoto.match(/\/([^/]+)\.[a-z]+$/);
      if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      }
    }

    // Upload new photo
    const profilePhotoUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) return reject(new Error('Image upload failed'));
          resolve(result.secure_url);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    propertyProvider.profilePhoto = profilePhotoUrl;
  }

  await propertyProvider.save();

  return res.status(200).json({
    success: true,
    message: "Property provider updated successfully",
    data: {
      propertyProvider
    }
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const propertyProvider = await PropertyProvider.findOne({ email });
  if (!propertyProvider) {
    return res.status(404).json({ message: 'propertyProvider not found.' });
  }

  const otpCode = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  propertyProvider.passwordResetCode = otpCode;
  propertyProvider.passwordResetExpiry = otpExpiry;
  await propertyProvider.save();

  try {
    await sendEmail({
      to: propertyProvider.email,
      subject: 'Password Reset Code',
      html: `
        <p>You requested to reset your password.</p>
        <p>Your password reset code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `
    });
    console.log('Password reset OTP sent.');
  } catch (err) {
    console.warn('Failed to send password reset email', err.message);
  }

  return res.status(200).json({
    message: 'Password reset code sent to email.',
    data: {
      email: propertyProvider.email,
      expiresAt: otpExpiry
    }
  });
});


export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }

  const propertyProvider = await PropertyProvider.findOne({ email });
  if (!propertyProvider) {
    return res.status(404).json({ message: 'propertyProvider not found.' });
  }

  const now = new Date();
  if (
    propertyProvider.passwordResetCode !== otp ||
    !propertyProvider.passwordResetExpiry ||
    now > propertyProvider.passwordResetExpiry
  ) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  propertyProvider.password = newPassword;
  propertyProvider.passwordResetCode = null;
  propertyProvider.passwordResetExpiry = null;

  await propertyProvider.save();

  return res.status(200).json({ message: 'Password reset successfully.' });
});
