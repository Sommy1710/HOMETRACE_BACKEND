//import sanitize from 'mongo-sanitize';
import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import {CreateUserRequest, UpdateUserRequest} from './create-user.request.js';
import { AuthUserRequest, } from './auth-user.request.js';
import { ValidationError } from '../../lib/error-definitions.js';
//import config from '../../config/app.config.js';
import {User} from './user.schema.js';
import {v2 as cloudinary} from 'cloudinary';
import {sendEmail} from '../../lib/emailService.js';
import { deleteUserById } from './user.service.js';
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

export const createUserAccount = asyncHandler(async (req, res) => {
    const validator = new Validator();
    const { value, errors } = validator.validate(CreateUserRequest, req.body);

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

    const userData = {
        ...value,
        profilePhoto: profilePhotoUrl,
        emailVerificationCode: otpCode,
        emailCodeExpiry: otpExpiry,
        isEmailVerified: false,
    };

    await authService.registerUser(userData);

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
        message: 'User registered successfully. OTP sent to email.',
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

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ message: 'Email is already verified.' });
  }

  const now = new Date();
  if (user.emailVerificationCode !== otp || now > user.emailCodeExpiry) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = null;
  user.emailCodeExpiry = null;

  await user.save();

  return res.status(200).json({ message: 'Email verified successfully.' });
});

export const authenticateUser = asyncHandler(async(req, res) => {
  const validator = new Validator();
  const {value, errors} = validator.validate(AuthUserRequest, req.body);
  if (errors) throw new ValidationError('the request failed with the following errors', errors);

  const user = await User.findOne({email: value.email});
  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }
  if (!user.isEmailVerified) {
    //generate new OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); //10 minutes

    user.emailVerificationCode = otpCode;
    user.emailCodeExpiry = otpExpiry;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
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
  const token = await authService.authenticateUser(value, req);
  res.cookie("authentication", token);
  return res.status(200).json({success: true, message: "user successfully logged in"});

});

export const getAuthenticatedUser = asyncHandler(async(req, res) =>
{
    const user = req.user;
    return res.status(200).json({
        success: true,
        message: "user found successfully",
        data: {
            user
        },
    });
});

export const deleteUserAccount = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requester = req.user;

  // Allow if requester is admin or super admin
  const isAdmin = ['admin'].includes(requester.role);

  //  Allow if requester is deleting their own account
  const isSelf = requester.id === userId;

  if (!isAdmin && !isSelf) {
    throw new UnauthorizedError("You are not authorized to delete this account");
  }

  const deleted = await deleteUserById(userId);

  res.status(200).json({
    success: true,
    message: "User account deleted successfully"
  });
});




export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('authentication', {
    httpOnly: true,
    secure: config.environment === 'production',
    sameSite: 'Strict'
  });

  return res.status(200).json({ success: true, message: 'User successfully logged out' });
});

export const deleteprofilePhoto = asyncHandler(async (req, res) => {
  const requester = req.user;

  // Ensure the requester is authenticated
  if (!requester) {
    throw new UnauthorizedError("You must be logged in to delete your profile photo.");
  }

  const user = await User.findById(requester.id);
  if (!user) {
    return res.status(404).json({ message: "user not found." });
  }

  // Check if profile photo exists
  if (!user.profilePhoto) {
    return res.status(400).json({ message: "No profile photo to delete." });
  }

  // Extract public_id from the Cloudinary URL
  const publicIdMatch = user.profilePhoto.match(/\/([^/]+)\.[a-z]+$/);
  if (!publicIdMatch) {
    return res.status(400).json({ message: "Invalid profile photo URL." });
  }

  const publicId = publicIdMatch[1];

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    user.profilePhoto = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo deleted successfully."
    });
  } catch (error) {
    console.error("Failed to delete profile photo:", error.message);
    return res.status(500).json({ message: "Failed to delete profile photo." });
  }
});




export const updateUserAccount = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requester = req.user;

  const isAdmin = ['admin'].includes(requester.role);
  const isSelf = requester.id === userId;

  if (!isAdmin && !isSelf) {
    throw new UnauthorizedError("You are not authorized to update this account");
  }

  const validator = new Validator();
  const { value, errors } = validator.validate(UpdateUserRequest, req.body);

  if (errors) {
    throw new ValidationError('The request failed with the following errors', errors);
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Update allowed fields
  Object.assign(user, value);

  // Handle profile photo update
  if (req.file) {
    // Delete old photo if exists
    if (user.profilePhoto) {
      const publicIdMatch = user.profilePhoto.match(/\/([^/]+)\.[a-z]+$/);
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

    user.profilePhoto = profilePhotoUrl;
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      user
    }
  });
});


/*function generateOTP() {
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createUserAccount = asyncHandler(async (req, res) => {

    const validator = new Validator();
    const {value, errors} = validator.validate(CreateUserRequest, req.body);

    if (errors) {
        throw new ValidationError(
            'The request failed with the following errors',
            errors
        );
    }

      let profilePhotoUrl = '';
    
      // Handle image upload with a Promise
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

      const emailToken = crypto.randomBytes(32).toString('hex');
      const emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const userData = {
        ...value,
        profilePhoto: profilePhotoUrl,
        emailVerificationToken: emailToken,
        emailTokenExpiry: emailTokenExpiry,
      };

      await authService.registerUser(userData);

      const verificationUrl = `${process.env.APP_BASE_URL}/auth/verify-email?token=${emailToken}`;
      console.log(`verificationUrl ${verificationUrl}`);

      try {
        await sendEmail({
            to: value.email,
            subject: 'verify your email address',
            html: `
                <p> thank you for registering, please verify your email by clicking the link below</p>
                <a> href="${verificationUrl}verify email</a>
                <p> this link expires in 24 hours</p>`
        });
        console.log('verification email sent successfully.');
      } catch (err) {
        console.warn('failed to send verification email', err.message);
      }

      return res.status(201).json({
        message: 'user registered successfully. Verification email sent.',
        data: {
            userData
        }
      });
});
*/


