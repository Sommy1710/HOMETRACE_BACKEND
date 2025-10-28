import {ConflictError, NotFoundError} from '../../lib/error-definitions.js';
import {PropertyProvider} from './propertyProvider.schema.js';

export const createPropertyProvider = async(payload) =>
{
    //check if a record already exists with the user details
    const propertyProvider = await PropertyProvider.findOne({
        $or: [
            {email: payload.email},
            {username: payload.username}
        ]
    });
    if (propertyProvider) throw new ConflictError('a property provider with the provided details already exixts');
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