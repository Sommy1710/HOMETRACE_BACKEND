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
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    role: {
        type: String,
        default: 'propertyProvider',
        immutable: true
    },
    emailVerificationCode: String,
    emailCodeExpiry: Date,

    isDeleted: {type: Boolean, default: false},
    deleteRequestedAt: Date,

}, {timestamps: true});

PropertyProviderSchema.pre('save', async function(next)
{
    if (this.isModified('password'))
    {
        this.password = await argon.hash(this.password);
    }
    next();
});
 
export const PropertyProvider = model('PropertyProvider', PropertyProviderSchema);


