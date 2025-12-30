import mongoose, {model, Schema} from 'mongoose';

import argon from 'argon2'

const UserSchema = new Schema ({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'Nigeria'
    },
    profilePhoto: {type: String, default: ''},
    isEmailVerified: {type: Boolean, default: false},
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    emailVerificationCode: String,
    emailCodeExpiry: Date,

    passwordResetCode: String,
    passwordResetExpiry: Date,

    isDeleted: {type: Boolean, default: false},
    deleteRequestedAt: Date,
}, {timestamps: true});

UserSchema.pre('save', async function(next)
{
    if (this.isModified('password'))
    {
        this.password = await argon.hash(this.password);
    }
    next();
});
 
export const User = model('User', UserSchema);


const FavouriteSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    listing: {type: Schema.Types.ObjectId, ref: 'Listing', required: true},
    createdAt: {type: Date, default: Date.now}
});

export const Favourite = model('Favourite', FavouriteSchema);