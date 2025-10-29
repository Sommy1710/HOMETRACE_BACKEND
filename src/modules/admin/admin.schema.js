import mongoose, {model, Schema} from 'mongoose';
import argon from 'argon2';

const AdminSchema = new Schema ({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, default: 'admin'},
}, {timestamps: true});

AdminSchema.pre('save', async function(next)
{
    if (this.isModified('password'))
    {
        this.password = await argon.hash(this.password);
    }
    next();
});

export const Admin = model('Admin', AdminSchema);
