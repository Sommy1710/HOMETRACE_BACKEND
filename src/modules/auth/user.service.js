import {ConflictError, NotFoundError} from '../../lib/error-definitions.js';
import {User} from './user.schema.js';

export const createUser = async(payload) =>
{
    //check if a record already exists with the user details
    const user = await User.findOne({
        $or: [
            {email: payload.email},
            {username: payload.username}
        ]
    });
    if (user) throw new ConflictError('a user with the provided details already exixts');
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