import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import {CreatePropertyProviderRequest, UpdatePropertyProviderRequest} from './create-propertyProvider.request.js';
import { AuthPropertyProviderRequest } from './auth-propertyProvider.request.js';
import { ValidationError, NotFoundError } from '../../lib/error-definitions.js';
import {PropertyProvider} from './propertyProvider.schema.js';
import {v2 as cloudinary} from 'cloudinary';
import {sendEmail} from '../../lib/emailService.js';
import { deletePropertyProviderById } from './propertyProvider.service.js';
import config from '../../config/app.config.js';
import { UnauthorizedError } from '../../lib/error-definitions.js';
import crypto from 'crypto';
import { createNotification } from "../notifications/notification.service.js";
import {User} from "../auth/user.schema.js";
import { ProfileView } from './propertyProvider.schema.js';




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

  // check if banned 
  if (propertyProvider.isBanned) {
    return res.status(403).json({
      success: false,
      massage: "Your account has been banned.",
      data: {
        bannedAt: propertyProvider.bannedAt,
        reason: propertyProvider.banReason
      }
    });
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
  const isSelf = requester.id.toString() === propertyProviderId;

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

  //const isAdmin = ['admin'].includes(requester.role);
  const isSelf = requester.id.toString() === propertyProviderId;

  if (!isSelf) {
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


/*export const toggleFollowPropertyProvider = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  // Identify follower (PropertyProvider first, then User)
  let followerId, followerModel, followerUsername = "Someone";

  if (req.propertyProvider?.id || req.propertyProvider?._id) {
    followerId = req.propertyProvider._id || req.propertyProvider.id;
    followerModel = "PropertyProvider";
    followerUsername = req.propertyProvider.username || 
      (await PropertyProvider.findById(followerId).select("username"))?.username || "Someone";
  } else if (req.user?.id || req.user?._id) {
    followerId = req.user._id || req.user.id;
    followerModel = "User";
    followerUsername = req.user.username || 
      (await User.findById(followerId).select("username"))?.username || "Someone";
  } else {
    throw new UnauthorizedError("Not authenticated");
  }

  // Prevent self-follow
  if (followerModel === "PropertyProvider" && followerId.toString() === propertyProviderId) {
    throw new ValidationError("You cannot follow yourself");
  }

  // Fetch target provider
  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) throw new ValidationError("Property provider not found");

  // Check follow state
  const alreadyFollowing = provider.followers.some(
    f => f.followerId.toString() === followerId.toString() && f.followerModel === followerModel
  );

  if (alreadyFollowing) {
    // Unfollow
    provider.followers = provider.followers.filter(
      f => !(f.followerId.toString() === followerId.toString() && f.followerModel === followerModel)
    );
  } else {
    // Follow
    provider.followers.push({ followerId, followerModel, followedAt: new Date() });

    // Create notification
    await createNotification({
      recipient: provider._id,
      recipientModel: "PropertyProvider",
      sender: followerId,
      senderModel: followerModel,
      type: "NEW_FOLLOWER",
      entityId: provider._id,
      entityModel: "PropertyProvider",
      message: `${followerUsername} started following you`
    });
  }

  await provider.save();

  res.status(200).json({
    success: true,
    message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
    data: {
      following: !alreadyFollowing,
      followersCount: provider.followers.length
    }
  });
});*/
/*export const toggleFollowPropertyProvider = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  // Identify follower (PropertyProvider first, then User)
  let followerId, followerModel, followerUsername = "Someone";

  if (req.propertyProvider?.id || req.propertyProvider?._id) {
    followerId = req.propertyProvider._id || req.propertyProvider.id;
    followerModel = "PropertyProvider";
    followerUsername = req.propertyProvider.username || 
      (await PropertyProvider.findById(followerId).select("username"))?.username || "Someone";
  } else if (req.user?.id || req.user?._id) {
    followerId = req.user._id || req.user.id;
    followerModel = "User";
    followerUsername = req.user.username || 
      (await User.findById(followerId).select("username"))?.username || "Someone";
  } else {
    throw new UnauthorizedError("Not authenticated");
  }

  // Prevent self-follow
  if (followerModel === "PropertyProvider" && followerId.toString() === propertyProviderId) {
    throw new ValidationError("You cannot follow yourself");
  }

  // Fetch target provider
  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) throw new ValidationError("Property provider not found");

  // Check follow state
  const alreadyFollowing = provider.followers.some(
    f => f.followerId.toString() === followerId.toString() && f.followerModel === followerModel
  );

  if (alreadyFollowing) {
    // UNFOLLOW: remove from target's followers
    provider.followers = provider.followers.filter(
      f => !(f.followerId.toString() === followerId.toString() && f.followerModel === followerModel)
    );

    // If actor is a PropertyProvider, also remove from their following
    if (followerModel === "PropertyProvider") {
      const actor = await PropertyProvider.findById(followerId);
      actor.following = actor.following.filter(
        f => f.followingId.toString() !== propertyProviderId
      );
      await actor.save();
    }
  } else {
    // FOLLOW: add to target's followers
    provider.followers.push({ followerId, followerModel, followedAt: new Date() });

    // If actor is a PropertyProvider, also add to their following
    if (followerModel === "PropertyProvider") {
      const actor = await PropertyProvider.findById(followerId);
      actor.following.push({ followingId: provider._id, followingModel: "PropertyProvider", followedAt: new Date() });
      await actor.save();
    }

    // Create notification
    await createNotification({
      recipient: provider._id,
      recipientModel: "PropertyProvider",
      sender: followerId,
      senderModel: followerModel,
      type: "NEW_FOLLOWER",
      entityId: provider._id,
      entityModel: "PropertyProvider",
      message: `${followerUsername} started following you`
    });
  }

  await provider.save();

  res.status(200).json({
    success: true,
    message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
    data: {
      following: !alreadyFollowing,
      followersCount: provider.followers.length
    }
  });
});*/

/*export const toggleFollowPropertyProvider = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  let followerId, followerModel, followerUsername = "Someone";
  let actor;

  // Force propertyProvider branch first
  if (req.propertyProvider && (req.propertyProvider._id || req.propertyProvider.id)) {
    followerId = req.propertyProvider._id?.toString() || req.propertyProvider.id?.toString();
    followerModel = "PropertyProvider";

    actor = await PropertyProvider.findById(followerId);
    if (!actor) {
      return res.status(404).json({ success: false, message: "Follower PropertyProvider not found" });
    }
    followerUsername = req.propertyProvider.username || actor.username || "Someone";

  } else if (req.user && (req.user._id || req.user.id)) {
    followerId = req.user._id?.toString() || req.user.id?.toString();
    followerModel = "User";

    actor = await User.findById(followerId);
    if (!actor) {
      return res.status(404).json({ success: false, message: "Follower User not found" });
    }
    followerUsername = req.user.username || actor.username || "Someone";

  } else {
    throw new UnauthorizedError("Not authenticated");
  }

  if (followerModel === "PropertyProvider" && followerId === propertyProviderId) {
    throw new ValidationError("You cannot follow yourself");
  }

  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) throw new ValidationError("Property provider not found");

  const alreadyFollowing = provider.followers.some(
    f => f.followerId.toString() === followerId && f.followerModel === followerModel
  );

  if (alreadyFollowing) {
    provider.followers = provider.followers.filter(
      f => !(f.followerId.toString() === followerId && f.followerModel === followerModel)
    );

    actor.following = actor.following.filter(f => f.followingId.toString() !== propertyProviderId);
    await actor.save();

  } else {
    provider.followers.push({ followerId, followerModel, followedAt: new Date() });

    actor.following.push({ followingId: provider._id, followingModel: "PropertyProvider", followedAt: new Date() });
    await actor.save();

    await createNotification({
      recipient: provider._id,
      recipientModel: "PropertyProvider",
      sender: followerId,
      senderModel: followerModel,
      type: "NEW_FOLLOWER",
      entityId: provider._id,
      entityModel: "PropertyProvider",
      message: `${followerUsername} started following you`
    });
  }

  await provider.save();

  res.status(200).json({
    success: true,
    message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
    data: {
      following: !alreadyFollowing,
      followersCount: provider.followers.length
    }
  });
});*/



export const toggleFollowPropertyProvider = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  let followerId, followerModel, followerUsername = "Someone";
  let actor;

  // Case 1: propertyProvider explicitly set
  if (req.propertyProvider?.id || req.propertyProvider?._id) {
    followerId = req.propertyProvider._id?.toString() || req.propertyProvider.id?.toString();
    followerModel = "PropertyProvider";
    actor = await PropertyProvider.findById(followerId);
    if (!actor) return res.status(404).json({ success: false, message: "Follower PropertyProvider not found" });
    followerUsername = req.propertyProvider.username || actor.username || "Someone";

  // Case 2: user payload but role is propertyProvider
  } else if (req.user?.role === "propertyProvider") {
    followerId = req.user._id?.toString() || req.user.id?.toString();
    followerModel = "PropertyProvider";
    actor = await PropertyProvider.findById(followerId);
    if (!actor) return res.status(404).json({ success: false, message: "Follower PropertyProvider not found" });
    followerUsername = req.user.username || actor.username || "Someone";

  // Case 3: normal user
  } else if (req.user?.id || req.user?._id) {
    followerId = req.user._id?.toString() || req.user.id?.toString();
    followerModel = "User";
    actor = await User.findById(followerId);
    if (!actor) return res.status(404).json({ success: false, message: "Follower User not found" });
    followerUsername = req.user.username || actor.username || "Someone";

  } else {
    throw new UnauthorizedError("Not authenticated");
  }

  // Prevent self-follow
  if (followerModel === "PropertyProvider" && followerId === propertyProviderId) {
    throw new ValidationError("You cannot follow yourself");
  }

  // Fetch target provider
  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) throw new ValidationError("Property provider not found");

  // Check follow state
  const alreadyFollowing = provider.followers.some(
    f => f.followerId.toString() === followerId && f.followerModel === followerModel
  );

  if (alreadyFollowing) {
    // UNFOLLOW
    provider.followers = provider.followers.filter(
      f => !(f.followerId.toString() === followerId && f.followerModel === followerModel)
    );
    actor.following = actor.following.filter(f => f.followingId.toString() !== propertyProviderId);
  } else {
    // FOLLOW
    provider.followers.push({ followerId, followerModel, followedAt: new Date() });
    actor.following.push({
      followingId: provider._id,
      followingModel: "PropertyProvider",
      followedAt: new Date()
    });

    await createNotification({
      recipient: provider._id,
      recipientModel: "PropertyProvider",
      sender: followerId,
      senderModel: followerModel,
      type: "NEW_FOLLOWER",
      entityId: provider._id,
      entityModel: "PropertyProvider",
      message: `${followerUsername} started following you`
    });
  }

  await provider.save();
  await actor.save();

  res.status(200).json({
    success: true,
    message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
    data: {
      following: !alreadyFollowing,
      followersCount: provider.followers.length
    }
  });
});




export const logProfileView = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) {
    return res.status(404).json({ message: "Property provider not found." });
  }

  let viewerId = null;
  let viewerModel = null;
  let isFollower = false;

  if (req.user?._id) {
    viewerId = req.user._id;
    viewerModel = "User";
    isFollower = provider.followers.some(
      f => f.followerId.toString() === viewerId.toString() && f.followerModel === "User"
    );
  } else if (req.propertyProvider?.id) {
    //Skip logging if provider is viewing their own profile
    if (req.propertyProvider.id.toString() !== propertyProviderId.toString()) {
      viewerId = req.propertyProvider.id;
      viewerModel = "PropertyProvider";
      isFollower = provider.followers.some(
        f => f.followerId.toString() === viewerId.toString() && f.followerModel === "PropertyProvider"
      );
    }
  } else {
    throw new UnauthorizedError("Not authenticated");
  }

  if (viewerId && viewerModel) {
    await ProfileView.create({
      providerId: provider._id,
      viewerId,
      viewerModel,
      isFollower
    });
  }

  return res.status(200).json({ success: true, message: "Profile view logged" });
});



export const getProfileViewAnalytics = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;
  const requester = req.propertyProvider;

  if (!requester) {
    throw new UnauthorizedError("You must be logged in as a property provider to view analytics.");
  }

  if (!requester.id || !propertyProviderId) {
    throw new UnauthorizedError("Invalid request: missing provider ID.");
  }

  if (requester.id.toString() !== propertyProviderId.toString()) {
    throw new UnauthorizedError("You are not authorized to view analytics for another provider.");
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const stats = await ProfileView.aggregate([
    { $match: { providerId: requester.id, viewedAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: "$isFollower", count: { $sum: 1 } } }
  ]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const followerCount = stats.find(s => s._id === true)?.count || 0;
  const nonFollowerCount = total - followerCount;

  return res.status(200).json({
    success: true,
    data: {
      totalViews: total,
      followerViews: followerCount,
      nonFollowerViews: nonFollowerCount,
      followerPercentage: total > 0 ? (followerCount / total) * 100 : 0,
      nonFollowerPercentage: total > 0 ? (nonFollowerCount / total) * 100 : 0
    }
  });
});

export const getAccountsReached = asyncHandler(async (req, res) => {
  const {propertyProviderId} = req.params;
  const requester = req.propertyProvider;

  if (!requester) {
    throw new UnauthorizedError('you must be logged in as a property provider to view accounts reached');

  }
  if (!requester.id || requester.id.toString() !== propertyProviderId.toString()) {
    throw new UnauthorizedError('you are not authorized to view accounts reached for another provider.');
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 10);

  //aggregate unique viewers in the last 30 days
  const stats = await ProfileView.aggregate([
    {$match: {providerId: requester.id, viewedAt: {$gte: thirtyDaysAgo}}},
    {$group: {_id: "$viewerId"}},
    {$count: "uniqueViewers"}
  ])

  const accountsReached = stats.length > 0 ? stats[0].uniqueViewers : 0;
  return res.status(200).json({
    success: true,
    data: {
      accountsReached,
      period: "last 30 days"
    }
  });
});


export const getFollowersOfPropertyProvider = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  // Ensure requester is authenticated
  if (!req.user && !req.propertyProvider) {
    throw new UnauthorizedError("Not authenticated");
  }

  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) {
    return res.status(404).json({ message: "Property provider not found." });
  }

  // Followers are stored as { followerId, followerModel }
  const followers = await Promise.all(
    provider.followers.map(async (f) => {
      if (f.followerModel === "User") {
        const user = await User.findById(f.followerId).select("username profilePhoto");
        return {
          id: f.followerId,
          model: f.followerModel,
          username: user?.username || "Unknown User",
          profilePhoto: user?.profilePhoto || null,
        };
      } else if (f.followerModel === "PropertyProvider") {
        const pp = await PropertyProvider.findById(f.followerId).select("username profilePhoto");
        return {
          id: f.followerId,
          model: f.followerModel,
          username: pp?.username || "Unknown Provider",
          profilePhoto: pp?.profilePhoto || null,
        };
      }
      return null;
    })
  );

  const resolvedFollowers = followers.filter(Boolean);

  res.status(200).json({
    success: true,
    message: "Followers retrieved successfully",
    followers: resolvedFollowers.length,
    data: resolvedFollowers,
  });
});

/*export const getFollowingOfPropertyProvider = asyncHandler(async (req, res) => {
  const { propertyProviderId } = req.params;

  // Ensure requester is authenticated
  if (!req.user && !req.propertyProvider) {
    throw new UnauthorizedError("Not authenticated");
  }

  const provider = await PropertyProvider.findById(propertyProviderId);
  if (!provider) {
    return res.status(404).json({ message: "Property provider not found." });
  }

  // Following are stored as { followingId, followingModel }
  const following = await Promise.all(
    provider.following.map(async (f) => {
      if (f.followingModel === "PropertyProvider") {
        const pp = await PropertyProvider.findById(f.followingId).select("username profilePhoto");
        return {
          id: f.followingId,
          model: f.followingModel,
          username: pp?.username || "Unknown Provider",
          profilePhoto: pp?.profilePhoto || null,
        };
      }
      // If later you allow following Users, you can add a branch here
      return null;
    })
  );

  res.status(200).json({
    success: true,
    message: "Following retrieved successfully",
    data: following.filter(Boolean),
  });
});

export const getFollowingOfUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Resolve following list
  const following = await Promise.all(
    user.following.map(async (f) => {
      if (f.followingModel === "PropertyProvider") {
        const pp = await PropertyProvider.findById(f.followingId).select("username profilePhoto");
        return {
          id: f.followingId,
          model: f.followingModel,
          username: pp?.username || "Unknown Provider",
          profilePhoto: pp?.profilePhoto || null,
        };
      }
      return null;
    })
  );

  res.status(200).json({
    success: true,
    message: "Following retrieved successfully",
    data: following.filter(Boolean),
  });
});*/




export const getFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Debug log: check what ID is coming in
  console.log("Route param id:", id);

  // Ensure requester is authenticated
  if (!req.user && !req.propertyProvider) {
    throw new UnauthorizedError("Not authenticated");
  }

  // Try to find actor in User collection first
  let actor = await User.findById(id);
  let actorType = "User";

  if (!actor) {
    // If not a User, try PropertyProvider
    actor = await PropertyProvider.findById(id);
    actorType = "PropertyProvider";
    if (!actor) {
      return res.status(404).json({ message: `No User or PropertyProvider found with id ${id}` });
    }
  }

  const followingList = actor.following || [];

  const following = await Promise.all(
    followingList.map(async (f) => {
      if (f.followingModel === "PropertyProvider") {
        const pp = await PropertyProvider.findById(f.followingId).select("username profilePhoto");
        return {
          id: f.followingId,
          model: f.followingModel,
          username: pp?.username || "Unknown Provider",
          profilePhoto: pp?.profilePhoto || null,
        };
      }
      return null;
    })
  );

  const resolvedFollowing = following.filter(Boolean);

  res.status(200).json({
    success: true,
    message: `${actorType} following retrieved successfully`,
    following: resolvedFollowing.length,
    data: resolvedFollowing,
  });
});





/*async function fixFollowerModels() {
  const providers = await PropertyProvider.find({});
  for (const provider of providers) {
    let changed = false;

    for (const follower of provider.followers) {
      // If marked as User but actually exists in PropertyProvider
      if (follower.followerModel === "User") {
        const isPP = await PropertyProvider.findById(follower.followerId);
        if (isPP) {
          follower.followerModel = "PropertyProvider";
          changed = true;
        }
      }
    }

    if (changed) {
      await provider.save();
      console.log(`Fixed followers for provider ${provider._id}`);
    }
  }
}

fixFollowerModels();*/
