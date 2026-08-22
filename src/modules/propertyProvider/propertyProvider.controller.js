import {asyncHandler} from '../../lib/util.js';
import * as authService from './auth.service.js';
import {Validator} from '../../lib/validator.js';
import {CreatePropertyProviderRequest, UpdatePropertyProviderRequest} from './create-propertyProvider.request.js';
import { AuthPropertyProviderRequest } from './auth-propertyProvider.request.js';
import { ValidationError, NotFoundError } from '../../lib/error-definitions.js';
import {PropertyProvider, Follow} from './propertyProvider.schema.js';
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

export const toggleFollow = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Ensure authenticated
    if (!req.user && !req.propertyProvider) {
        throw new UnauthenticatedError("Authentication required");
    }

    // Determine who is performing the follow
    let followerId;
    let followerModel;

    if (req.user?.role === "propertyProvider") {
        followerId = req.user.id;
        followerModel = "PropertyProvider";
    } else if (req.user) {
        followerId = req.user.id;
        followerModel = "User";
    } else {
        followerId = req.spotOwner.id;
        followerModel = "PropertyProvider";
    }

    // Find account being followed
    let followingAccount =
        await User.findById(id).select("_id followersCount followingCount");

    let followingModel = "User";

    if (!followingAccount) {
        followingAccount =
            await PropertyProvider.findById(id).select("_id followersCount followingCount");

        followingModel = "PropertyProvider";
    }

    if (!followingAccount) {
        throw new NotFoundError("Account not found");
    }

    // Prevent self-follow
    if (
        followerId.toString() === followingAccount._id.toString() &&
        followerModel === followingModel
    ) {
        throw new ValidationError("You cannot follow yourself.");
    }

    // Check existing relationship
    const existingFollow = await Follow.findOne({
        follower: followerId,
        followerModel,
        following: followingAccount._id,
        followingModel,
    });

    // ======================
    // UNFOLLOW
    // ======================
    if (existingFollow) {
        await Follow.deleteOne({ _id: existingFollow._id });

        await Promise.all([
            followingModel === "User"
                ? User.findByIdAndUpdate(
                      followingAccount._id,
                      { $inc: { followersCount: -1 } }
                  )
                : PropertyProvider.findByIdAndUpdate(
                      followingAccount._id,
                      { $inc: { followersCount: -1 } }
                  ),

            followerModel === "User"
                ? User.findByIdAndUpdate(
                      followerId,
                      { $inc: { followingCount: -1 } }
                  )
                : PropertyProvider.findByIdAndUpdate(
                      followerId,
                      { $inc: { followingCount: -1 } }
                  ),
        ]);

        return res.status(200).json({
            success: true,
            message: "Account unfollowed successfully.",
            following: false,
        });
    }

    // ======================
    // FOLLOW
    // ======================
    await Follow.create({
        follower: followerId,
        followerModel,
        following: followingAccount._id,
        followingModel,
    });

    await Promise.all([
        followingModel === "User"
            ? User.findByIdAndUpdate(
                  followingAccount._id,
                  { $inc: { followersCount: 1 } }
              )
            : PropertyProvider.findByIdAndUpdate(
                  followingAccount._id,
                  { $inc: { followersCount: 1 } }
              ),

        followerModel === "User"
            ? User.findByIdAndUpdate(
                  followerId,
                  { $inc: { followingCount: 1 } }
              )
            : PropertyProvider.findByIdAndUpdate(
                  followerId,
                  { $inc: { followingCount: 1 } }
              ),
    ]);

    //create notification
    //get follower information for the notification message
    let followerAccount;

    if(followerModel === "User") {
      followerAccount = await User.findById(
        followerId
      ).select("username");
    } else {
      followerAccount = await PropertyProvider.findById(
        followerId
      ).select("username firstname lastname");
    }

    const followerName = followerModel === "PropertyProvider"
    ? `${followerAccount?.firstname || ""} ${followerAccount?.lastname || ""}`.trim()
    : followerAccount?.username;

    await createNotification({

        // Person receiving notification
        recipient: followingAccount._id,

        recipientModel: followingModel,

        // Person who followed
        sender: followerId,

        senderModel: followerModel,

        type: "NEW_FOLLOWER",

        // The entity that caused the notification
        entityId: followerId,

        entityModel: followerModel,

        message: `${followerName || "Someone"} started following you.`

    });

    return res.status(200).json({
        success: true,
        message: "Account followed successfully.",
        following: true,
    });
});



/*const resolveAccount = async (id) => {
  let account = await User.findById(id)
    .select("_id username firstname lastname profilePhoto bio role followersCount followingCount")
    .lean();

  if (account) {
    return {
      account,
      accountModel: "User",
    };
  }

  account = await PropertyProvider.findById(id)
    .select("_id username firstname lastname profilePhoto bio role followersCount followingCount")
    .lean();

  if (account) {
    return {
      account,
      accountModel: "PropertyProvider",
    };
  }

  return null;
};

export const getFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Resolve the account being viewed
  const target = await resolveAccount(id);

  if (!target) {
    throw new NotFoundError("Account not found.");
  }

  const { account, accountModel } = target;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {
    following: account._id,
    followingModel: accountModel,
  };

  const [follows, total] = await Promise.all([
    Follow.find(filter)
      .populate({
        path: "follower",
        select: `
          _id
          username
          firstname
          lastname
          profilePhoto
          bio
          role
          followersCount
          followingCount
        `,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Follow.countDocuments(filter),
  ]);

  const followers = follows
    .filter((follow) => follow.follower)
    .map((follow) => ({
      followId: follow._id,
      followedAt: follow.createdAt,
      account: {
        ...follow.follower,
      },
    }));

  return res.status(200).json({
    success: true,
    message: "Followers retrieved successfully.",
    data: {
      account: {
        _id: account._id,
        username: account.username,
        firstname: account.firstname,
        lastname: account.lastname,
        profilePhoto: account.profilePhoto,
        bio: account.bio,
        role: account.role,
        followersCount: account.followersCount,
        followingCount: account.followingCount,
      },

      followers,

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


export const getFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Resolve the account
  const target = await resolveAccount(id);

  if (!target) {
    throw new NotFoundError("Account not found.");
  }

  const { account, accountModel } = target;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {
    follower: account._id,
    followerModel: accountModel,
  };

  const [follows, total] = await Promise.all([
    Follow.find(filter)
      .populate({
        path: "following",
        select: `
          _id
          username
          firstname
          lastname
          profilePhoto
          bio
          role
          followersCount
          followingCount
        `,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Follow.countDocuments(filter),
  ]);

  const following = follows
    .filter((follow) => follow.following)
    .map((follow) => ({
      followId: follow._id,
      followedAt: follow.createdAt,
      account: {
        ...follow.following,
      },
    }));

  return res.status(200).json({
    success: true,
    message: "Following retrieved successfully.",
    data: {
      account: {
        _id: account._id,
        username: account.username,
        firstname: account.firstname,
        lastname: account.lastname,
        profilePhoto: account.profilePhoto,
        bio: account.bio,
        role: account.role,
        followersCount: account.followersCount,
        followingCount: account.followingCount,
      },

      following,

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
});*/



const findAccountById = async (id) => {

    // Check User first
    const user = await User.findOne({
        _id: id,
        isDeleted: false
    })
        .select("_id username profilePhoto")
        .lean();

    if (user) {
        return {
            account: user,
            model: "User"
        };
    }

    // Check Property Provider
    const propertyProvider = await PropertyProvider.findOne({
        _id: id,
        isDeleted: false,
        isBanned: false
    })
        .select("_id username firstname lastname profilePhoto bio isVerified")
        .lean();

    if (propertyProvider) {
        return {
            account: propertyProvider,
            model: "PropertyProvider"
        };
    }

    return null;
};

export const getFollowers = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) {
        throw new ValidationError("Account ID is required.");
    }

    // Automatically determine whether the account is a User
    // or PropertyProvider
    const accountData = await findAccountById(id);

    if (!accountData) {
        throw new NotFoundError("Account not found.");
    }

    const { account, model } = accountData;


    // Find everyone following this account
    const follows = await Follow.find({
        following: id,
        followingModel: model
    })
        .sort({ createdAt: -1 })
        .lean();


    // Get follower profiles
    const followers = await Promise.all(

        follows.map(async (follow) => {

            const FollowerModel =
                follow.followerModel === "User"
                    ? User
                    : PropertyProvider;


            const follower = await FollowerModel.findOne({
                _id: follow.follower,
                isDeleted: false,

                ...(follow.followerModel === "PropertyProvider" && {
                    isBanned: false
                })

            })
                .select(
                    "_id username firstname lastname profilePhoto bio isVerified followersCount followingCount"
                )
                .lean();


            return follower;
        })
    );


    // Remove accounts that no longer exist
    const validFollowers = followers.filter(Boolean);


    return res.status(200).json({

        success: true,

        message: "Followers fetched successfully.",

        data: {

            account: {
                id: account._id,
                username: account.username,
                profilePhoto: account.profilePhoto,

                ...(model === "PropertyProvider" && {
                    firstname: account.firstname,
                    lastname: account.lastname
                })
            },

            total: validFollowers.length,

            followers: validFollowers
        }
    });
});

export const getFollowing = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!id) {
        throw new ValidationError("Account ID is required.");
    }

    // Automatically determine whether the account is a User
    // or PropertyProvider
    const accountData = await findAccountById(id);

    if (!accountData) {
        throw new NotFoundError("Account not found.");
    }

    const { account, model } = accountData;


    // Find everyone this account follows
    const follows = await Follow.find({
        follower: id,
        followerModel: model
    })
        .sort({ createdAt: -1 })
        .lean();


    // Get following profiles
    const following = await Promise.all(

        follows.map(async (follow) => {

            const FollowingModel =
                follow.followingModel === "User"
                    ? User
                    : PropertyProvider;


            const followingAccount = await FollowingModel.findOne({
                _id: follow.following,
                isDeleted: false,

                ...(follow.followingModel === "PropertyProvider" && {
                    isBanned: false
                })

            })
                .select(
                    "_id username firstname lastname profilePhoto bio isVerified followersCount followingCount"
                )
                .lean();


            return followingAccount;
        })
    );


    // Remove accounts that no longer exist
    const validFollowing = following.filter(Boolean);


    return res.status(200).json({

        success: true,

        message: "Following fetched successfully.",

        data: {

            account: {
                id: account._id,
                username: account.username,
                profilePhoto: account.profilePhoto,

                ...(model === "PropertyProvider" && {
                    firstname: account.firstname,
                    lastname: account.lastname
                })
            },

            total: validFollowing.length,

            following: validFollowing
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
