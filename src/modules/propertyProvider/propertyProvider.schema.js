import mongoose, {model, Schema} from 'mongoose';
import argon from 'argon2'

const PropertyProviderSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },

    lastname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'Nigeria'
    },
    bio: {
        type: String
    },
    profilePhoto: {type: String, default: ''},
    isEmailVerified: {type: Boolean, default: false},
    isVerified: {type: Boolean, default: false},
    
    followersCount: {
        type: Number,
        default: 0
    },

    followingCount: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default: 'propertyProvider',
        immutable: true
    },
    emailVerificationCode: String,
    emailCodeExpiry: Date,

    passwordResetCode: String,
    passwordResetExpiry: Date,

    isDeleted: {type: Boolean, default: false},
    deleteRequestedAt: Date,

    isBanned: {type: Boolean, default: false},
    bannedAt: Date,
    banReason: String

}, {timestamps: true});

PropertyProviderSchema.index({
    username: "text",
    firstname: "text",
    lastname: "text",
});

PropertyProviderSchema.pre('save', async function(next)
{
    if (this.isModified('password'))
    {
        this.password = await argon.hash(this.password);
    }
    next();
});
 
export const PropertyProvider = model('PropertyProvider', PropertyProviderSchema);

const ProfileViewSchema = new Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "PropertyProvider", required: true },
  viewerId: { type: mongoose.Schema.Types.ObjectId, refPath: "viewerModel" },
  viewerModel: { type: String, enum: ["User", "PropertyProvider"] },
  isFollower: { type: Boolean, default: false },
  viewedAt: { type: Date, default: Date.now }
});

export const ProfileView = model("ProfileView", ProfileViewSchema);

const FollowSchema = new Schema(
{
    follower: {
        type: Schema.Types.ObjectId,
        refPath: "followerModel",
        required: true
    },

    followerModel: {
        type: String,
        enum: ["User", "PropertyProvider"],
        required: true
    },

    following: {
        type: Schema.Types.ObjectId,
        refPath: "followingModel",
        required: true
    },

    followingModel: {
        type: String,
        enum: ["User", "PropertyProvider"],
        required: true
    }
},
{
    timestamps: true
});

FollowSchema.index({
    follower: 1,
    followerModel: 1
});

FollowSchema.index({
    following: 1,
    followingModel: 1
});

FollowSchema.index({
    follower: 1,
    followerModel: 1,
    following: 1,
    followingModel: 1
}, {
    unique: true
});

export const Follow = model('Follow', FollowSchema);
