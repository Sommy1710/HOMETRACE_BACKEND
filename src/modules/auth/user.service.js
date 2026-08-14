import {ConflictError, NotFoundError} from '../../lib/error-definitions.js';
import {User} from './user.schema.js';

export const createUser = async(payload) =>
{
    //check if a record already exists with the user details
    const existingEmail = await User.findOne({
        email: payload.email,
    });
    if (existingEmail) {
        throw new ConflictError("A user with the provided email already exists, please use a different email.");
    }
    const existingUsername = await User.findOne({
        username: payload.username,
    });

    if (existingUsername) {
        throw new ConflictError("A user with the provided username already exists, please use a different username.");
    }
    return await User.create(payload);
};

export const getUser = async(id) =>
{
    return await User.findById(id);
};

export const getUserByEmail = async(email) =>
{
    return await User.findOne({email});
};

export const getUserByRole = async(role) =>
{
    return await User.find({role});
};

export const deleteUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError('user not found');
    }

    await user.deleteOne();
    return {success: true, message: 'user deleted successfully'}
}