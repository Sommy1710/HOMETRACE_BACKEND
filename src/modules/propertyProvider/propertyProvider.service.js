import {ConflictError, NotFoundError} from '../../lib/error-definitions.js';
import {PropertyProvider} from './propertyProvider.schema.js';

export const createPropertyProvider = async(payload) =>
{
    //check if a record already exists with the user details
    const existingEmail = await PropertyProvider.findOne({
        email: payload.email,
    });
    if (existingEmail) {
        throw new ConflictError("A property provider with the provided email already exists, please try again with a different email.");
    }
    const existingUsername = await PropertyProvider.findOne({
        username: payload.username,
    });
    if (existingUsername) {
        throw new ConflictError("A property provider with the provided username already exists, please try again with a different username.");
    }
    return await PropertyProvider.create(payload);
};

export const getPropertyProvider = async(id) =>
{
    return await PropertyProvider.findById(id);
};

export const getPropertyProviderByEmail = async(email) =>
{
    return await PropertyProvider.findOne({email});
};

export const getPropertyProviderByRole = async(role) =>
{
    return await PropertyProvider.find({role});
};

export const deletePropertyProviderById = async (propertyProviderId) => {
    const propertyProvider = await PropertyProvider.findById(propertyProviderId);
    if (!propertyProvider) {
        throw new NotFoundError('Property provider not found');
    }

    await propertyProvider.deleteOne();
    return {success: true, message: 'Property provider deleted successfully'};
};